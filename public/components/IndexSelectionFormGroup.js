import React, {
  Component, Fragment
} from 'react';

import ReactDOM from 'react-dom';

import {
  EuiAccordion,
  EuiButton,
  EuiButtonEmpty,
  EuiCode,
  EuiCodeBlock,
  EuiDatePicker,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormControlLayout,
  EuiFormLabel,
  EuiFormRow,
  EuiHeader,
  EuiHeaderBreadcrumb,
  EuiHeaderBreadcrumbs,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiImage,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiTitle,
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
      newIndexValue: '',
    };

    this.addToast = props.addToast;

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
          this.addToast({
            title: "Error to create new index",
            type: "danger",
            msg: (<EuiCodeBlock language="json">{JSON.stringify(res.response.data)}</EuiCodeBlock>)
          });

          return;
        }

        this.addToast({
          title: "New index created",
          type: "success"
        });

        this.refreshIndices(this.state.newIndexValue);

        this.setState({
          newIndexValue: '',
        });

        this.accordionChild.onToggle();

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
          this.addToast({
            title: "Error to load indices",
            type: "danger",
            msg: (<EuiCodeBlock language="json">{JSON.stringify(res.response.data)}</EuiCodeBlock>)
          });

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
              <EuiFormRow label="choose an index to store your comment">
                <EuiSelect
                  options={this.state.options}
                  value={this.state.selectedIndex}
                  onChange={this.handleIndexChange}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiAccordion
          ref={ instance => {this.accordionChild = instance} }
          id="accordionNewIndex"
          buttonContent={<EuiText size="xs">You need a dedicated index for your comments ? Create a new one...</EuiText>}
          paddingSize="m"
          >
            <EuiFlexGroup style={{ maxWidth: 800 }}>
              <EuiFlexItem>
                <EuiFormRow label="new index name">
                  <EuiFormControlLayout
                  prepend={<EuiFormLabel htmlFor="createCommentIndexInput">{this.indexPrefix}</EuiFormLabel>}
                  append={<EuiButtonEmpty onClick={this.handleNewIndexCreate}>Create</EuiButtonEmpty>}
                  >
                    <input type="text"
                           className="euiFieldText euiFieldText--inGroup"
                           id="createCommentIndexInput"
                           value={this.state.newIndexValue}
                           onChange={this.handleNewIndexValueChange} />
                  </EuiFormControlLayout>
                </EuiFormRow>

              </EuiFlexItem>

            </EuiFlexGroup>

          </EuiAccordion>

        </Fragment>
      );

  }

}
