import React, {
  Component, Fragment
} from 'react';

import moment from 'moment';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCode,
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
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiImage,
  EuiIcon,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiTitle,
} from '@elastic/eui';

import IndexSelectionFormGroup from './IndexSelectionFormGroup'

import {
  loadIndices,
  submitComment,
} from '../lib/esClient'


export default class NewCommentModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      startDate: null,
      commentValue: null,
      selectedIndex: null,
      errors: {
        startDate: [],
        commentValue: []
      }
    };

    this.closeModal = props.onClose;

    this.handleIndexChange   = this.handleIndexChange.bind(this);
    this.handleDateChange    = this.handleDateChange.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.submit              = this.submit.bind(this);
  }

  handleIndexChange   = selectedIndex => { this.setState({ selectedIndex }); }
  handleDateChange    = startDate     => { this.setState({ startDate }); }
  handleCommentChange = e             => { this.setState({ commentValue: e.target.value }); }

  submit() {

    // validate data
    let errors = {};

    if (this.state.startDate)
      errors['startDate'] = ['The date is required'];
    else if (!moment(this.state.startDate).isValid())
      errors['startDate'] = ['The date format is invalid'];

    if (this.state.commentValue)
      errors['commentValue'] = ['The comment body must be filled'];

    if (errors) {

      this.setState({errors});
      return;
    }

    // submit to ES

    submitComment(this.state.selectedIndex, this.state.startDate, this.state.commentValue)
      .then((res) => {

        if (!res.status) {
          // error loading indices
          //TODO

          return;
        }

        // reset state
        this.setState({
          commentValue: '',
        })

        this.closeModal();
      })
      .catch((err) => {console.log(err)})
  }


  render() {

    return(

      <EuiModal
        onClose={this.closeModal}
        style={{ width: '800px' }}
      >
        <EuiModalHeader>
          <EuiModalHeaderTitle >
            Add a new comment
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <IndexSelectionFormGroup onChange={this.handleIndexChange} />

          <EuiSpacer />

          <EuiFlexGroup style={{ maxWidth: 800 }}>
            <EuiFlexItem>
              <EuiFormRow
                label="date"
                isInvalid={this.state.errors.startDate.length}
                error={this.state.errors.startDate}
              >
                <EuiDatePicker
                  showTimeSelect
                  isInvalid={this.state.errors.startDate.length}
                  selected={this.state.startDate}
                  onChange={this.handleDateChange}
                  dateFormat='DD/MM/YYYY HH:mm'
                  placeholder="select a relevant date for your comment"
                />
              </EuiFormRow>
              <EuiFormLabel>set to now</EuiFormLabel>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup style={{ maxWidth: 800 }}>
            <EuiFlexItem>
              <EuiFormRow
                label="comment"
                isInvalid={this.state.errors.commentValue.length}
                error={this.state.errors.commentValue}
                >
                <EuiTextArea
                  isInvalid={this.state.errors.commentValue}
                  onChange={this.handleCommentChange}
                  placeholder="write your comment here"
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={this.closeModal}>
            Cancel
          </EuiButtonEmpty>

          <EuiButton onClick={this.submit} fill>
            Save
          </EuiButton>
        </EuiModalFooter>

      </EuiModal>
    );
  }

};
