import React, {
  Component, Fragment
} from 'react';

import moment from 'moment';

import {
  EuiBasicTable,
  EuiButton,
  EuiFlexItem,
  EuiFlexGroup,
  EuiGlobalToastList,
  EuiIcon,
  EuiOverlayMask,
  EuiPortal,
  EuiSpacer,
  EuiText,
  EuiTextAlign,
} from '@elastic/eui';

import NewCommentModal from '../components/NewCommentModal'

import {
  findComments,
  deleteComments,
} from '../lib/esClient'

export default class ListComments extends Component {

  constructor(props) {

    super(props);

    this.toastId = 0;

    const defaultState = this.state = {
      pageOfItems: null,
      totalItemCount: 0,
      pageIndex: 0,
      pageSize: 20,
      sortField: 'date',
      sortDirection: 'desc',
      selectedItems: [],
      isModalVisible: false,
      toasts: [],
    };

    this.loadComments();

    this.onTableChange     = this.onTableChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onClickDelete     = this.onClickDelete.bind(this);

    this.closeModal = this.closeModal.bind(this);
    this.showModal  = this.showModal.bind(this);

    this.closeModalAndReloadComments = this.closeModalAndReloadComments.bind(this);
    this.setState({ isModalVisible: false });
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

        this.addToast({
          title: "Comment deleted",
          type: "success"
        });

        this.setState({
          selectedItems: []
        }, this.loadComments);

      })
      .catch((err) => {console.log(err)});

  };

  addToast = ({title, msg, type}) => {

    let text = msg || null;
    let iconType = null;

    switch(type) {
      case 'success':
        iconType = 'check';
        break;

      case 'danger':
        iconType = 'alert';
        break;

      case 'warning':
        iconType = 'help';
        break;

      default:
        break;
    }

   const toast = {
     id: (this.toastId++).toString(),
     title: title,
     color: type || "primary",
     iconType,
     text,
   }

   this.setState({
     toasts: this.state.toasts.concat(toast)
   });
 };

 removeToast = (removedToast) => {
   this.setState(prevState => ({
     toasts: prevState.toasts.filter(toast => toast.id !== removedToast.id),
   }));
 };

 removeAllToasts = () => {
   this.setState({
     toasts: [],
   });
 };

  renderAddButton() {

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
        this.setState({
          pageOfItems: (res.data && res.data.pageOfItems) || null,
          totalItemCount: (res.data && res.data.totalItemCount) || 0,
        });

      })
      .catch((err) => {
        console.log(err)
        this.setState({
          pageOfItems: null,
          totalItemCount: 0,
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


    // if (!pageOfItems)
    //   return null;

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

    let extraElements;
    let toastList = (
      <EuiGlobalToastList
        toasts={this.state.toasts}
        dismissToast={this.removeToast}
        toastLifeTimeMs={8000}
      />
    );

    let modal;
    if (this.state.isModalVisible) {
      modal = (
        <EuiOverlayMask>
          <NewCommentModal onClose={this.closeModalAndReloadComments} addToast={this.addToast} />
        </EuiOverlayMask>
      );
    }

    let table;
    if (pageOfItems) {
      table = (
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
      );
    }
    else {
      table = (
        <EuiText>
          <EuiTextAlign textAlign="center">
            <p>Any comments found</p>
          </EuiTextAlign>
        </EuiText>
      );
    }


    return (
      <Fragment>
        <EuiSpacer/>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>{addButton}</EuiFlexItem>
          <EuiFlexItem grow={false}>{deleteButton}</EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer/>

        {table}

        {modal}

        <EuiPortal>
          <EuiGlobalToastList
            toasts={this.state.toasts}
            dismissToast={this.removeToast}
            toastLifeTimeMs={8000}
          />
        </EuiPortal>

      </Fragment>
    );

  }

};
