import React, {
  Component, Fragment
} from 'react';

import moment from 'moment';

import {
  EuiPage,
  EuiPageHeader,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentBody,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderBreadcrumbs,
  EuiHeaderBreadcrumb,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiImage,
  EuiOverlayMask,
  EuiIcon,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBasicTable,
  EuiLink,
  EuiHealth,
  EuiButton,
  EuiSpacer,
} from '@elastic/eui';

import NewCommentModal from '../components/NewCommentModal'

import {
  findComments,
  deleteComments,
} from '../lib/esClient'

export default class ListComments extends Component {

  constructor(props) {
    super(props);

    const defaultState = this.state = {
      pageOfItems: null,
      totalItemCount: null,
      pageIndex: 0,
      pageSize: 20,
      sortField: 'date',
      sortDirection: 'desc',
      selectedItems: [],
      isModalVisible: false,
    };

    this.loadComments();

    this.onTableChange     = this.onTableChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onClickDelete     = this.onClickDelete.bind(this);

    this.closeModal = this.closeModal.bind(this);
    this.showModal  = this.showModal.bind(this);

    this.closeModalAndReloadComments = this.closeModalAndReloadComments.bind(this);
  }

  closeModal() {
    this.setState({ isModalVisible: false });
  }

  closeModalAndReloadComments() {
    this.closeModal();
    this.loadComments();
  }

  showModal() {
    this.setState({ isModalVisible: true });
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const {
      index: pageIndex,
      size: pageSize,
    } = page;

    const {
      field: sortField,
      direction: sortDirection,
    } = sort;

    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    }, this.loadComments);

  };

  onSelectionChange(selectedItems) {
    this.setState({ selectedItems });
  };

  onClickDelete() {
    const { selectedItems } = this.state;
    deleteComments(selectedItems.map((item) => ({index: item.index, id: item.id})))
      .then(() => {

        this.setState({
          selectedItems: []
        }, this.loadComments);

      });

  };

  renderAddButton() {

    let modal;

    if (this.state.isModalVisible) {
      modal = (
        <EuiOverlayMask>
          <NewCommentModal onClose={this.closeModalAndReloadComments} />
        </EuiOverlayMask>
      );
    }

    return (
      <Fragment>
        <EuiButton onClick={this.showModal}>
          <EuiIcon
            type="plusInCircle"
            size="xl"
            style={{paddingRight:"10px"}}
          />
          Add a new comment
        </EuiButton>

        {modal}
      </Fragment>
    );
  }

  renderDeleteButton() {
    const { selectedItems } = this.state;

    if (selectedItems.length === 0) {
      return;
    }

    return (
      <EuiButton
        color="danger"
        iconType="trash"
        onClick={this.onClickDelete}
      >
        Delete {selectedItems.length} comment{selectedItems.length === 1 ? '' : 's'}
      </EuiButton>
    );
  }

  loadComments() {

    const {
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    } = this.state;

    findComments({pageIndex, pageSize, sortField, sortDirection})
      .then((res) => {

        const {
          pageOfItems,
          totalItemCount,
        } = res.data;

        this.setState({
          pageOfItems,
          totalItemCount,
        });

      })
      .catch((err) => {

        console.log(err)
        this.setState({
          pageOfItems: null,
          totalItemCount: null,
        });

      });
  }

  render() {

    const {
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      pageOfItems,
      totalItemCount,
    } = this.state;


    if (!pageOfItems)
      return null;

    const columns = [{
      field: 'date',
      name: 'Date',
      sortable: true,
      truncateText: false,
      hideForMobile: false,
      dataType: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    }, {
      field: 'body',
      name: 'Body',
      sortable: true,
      truncateText: false,
      hideForMobile: false,
    }, {
      field: 'index',
      name: 'Index',
      sortable: true,
      truncateText: false,
      hideForMobile: false,
    }];

    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: totalItemCount,
      pageSizeOptions: [5, 20, 100]
    };

    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    };

    const selection = {
      selectable: (item) => item.id,
      onSelectionChange: this.onSelectionChange
    };

    const addButton    = this.renderAddButton();
    const deleteButton = this.renderDeleteButton();

    return (
      <Fragment>
        <EuiSpacer/>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>{addButton}</EuiFlexItem>
          <EuiFlexItem grow={false}>{deleteButton}</EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer/>

        <EuiBasicTable
          items={pageOfItems}
          itemId="id"
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          isSelectable={true}
          selection={selection}
          onChange={this.onTableChange}
        />
      </Fragment>
    );

  }

};
