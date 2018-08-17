import React, {
  Component, Fragment
} from 'react';

import ReactDOM from 'react-dom';

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
  EuiSpacer,
  EuiTextArea,
  EuiPanel,
  EuiCode,
  EuiDatePicker,
  EuiForm,
  EuiFormRow,
  EuiFormControlLayout,
  EuiFormLabel,
  EuiFieldText,
  EuiSelect,
  EuiButton,
  EuiImage,
  EuiIcon,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,

} from '@elastic/eui';

import {
  loadIndices,
  createIndex,
  createDefaultIndex,
} from '../lib/esClient.js';


export default class IndexSelectionFormGroup extends Component {

  constructor(props) {

    super(props);

    const {
      indexPrefix,
      onChange
    } = props;

    this.indexPrefix = indexPrefix || "comments-";

    this.state = {
      options: [],
      selectedIndex: '',
      newIndexValue: ''
    };

    // init the default index
    createDefaultIndex().then((resp)=> {

      if (resp.status)
        this.refreshIndices();
    })

    // This binding is necessary to make `this` work in the callback
    this.handleNewIndexValueChange = this.handleNewIndexValueChange.bind(this);
    this.handleNewIndexCreate      = this.handleNewIndexCreate.bind(this);
    this.handleIndexChange         = this.handleIndexChange.bind(this);

    // The onChange function is a callback from parent component
    this.selectIndex               = this.selectIndex.bind(this, onChange);
  }


  handleIndexChange = e => {

    this.selectIndex(e.target.value);
  }

  handleNewIndexValueChange = e => {

    const sanitizedValue = e.target.value;
    this.setState({
      newIndexValue: sanitizedValue
    });
  }

  handleNewIndexCreate = e => {

    createIndex(this.state.newIndexValue)
      .then((res) => {

        if (!res.status) {

          // error creating index
          // TODO

          return
        }

        this.refreshIndices(this.state.newIndexValue);
        this.setState({
          newIndexValue: ""
        });
      })
      .catch((err) => {console.log(err)})

  }

  selectIndex = (callback, indexName) => {

    this.setState({
      selectedIndex: indexName
    });

    callback(indexName);
  }

  refreshIndices = (selectedIndex) => {

    loadIndices()
      .then((res) => {

        if (!res.status) {
          // error loading indices
          //TODO

          return;
        }

        var options = res.data;

        if (selectedIndex)
          selectedIndex = this.indexPrefix + selectedIndex;
        else
          selectedIndex = options[0].value;

        this.setState({
          options: options
        });

        this.selectIndex(selectedIndex);
      })
      .catch((err) => {console.log(err)})
  }

  render() {

    return (
        <Fragment>
          <EuiFlexGroup style={{ maxWidth: 800 }}>
            <EuiFlexItem grow={false} style={{ width: 250 }}>
              <EuiFormRow label="choose an existing index">
                <EuiSelect
                  options={this.state.options}
                  value={this.state.selectedIndex}
                  onChange={this.handleIndexChange}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="create a new index">
                <EuiFieldText
                  id="createCommentIndexInput"
                  value={this.state.newIndexValue}
                  onChange={this.handleNewIndexValueChange}/>
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFormRow hasEmptyLabelSpace>
                <EuiButton onClick={this.handleNewIndexCreate}>Create</EuiButton>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      );

  }

}
