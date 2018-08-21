import React, {
  Component, Fragment
} from 'react';

import '@elastic/eui/dist/eui_theme_light.css';

import {
  EuiPage,
  EuiPageHeader,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiSpacer,
  EuiPanel,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderBreadcrumbs,
  EuiHeaderBreadcrumb,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiImage,
  EuiIcon,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiGlobalToastList,

} from '@elastic/eui';


import ListComments from '../components/ListComments'


const Main = (props) => {

  // var removeToast = (removedToast) => {
  //   this.setState(prevState => ({
  //     toasts: prevState.toasts.filter(toast => toast.id !== removedToast.id),
  //   }));
  // };


  return(
    <Fragment>
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>

          <EuiHeader style={{width: "100%"}}>
            <EuiHeaderSection>
              <EuiHeaderSectionItem border="right" style={{width: "5%"}}>
                <EuiFlexGroup justifyContent="center" style={{paddingTop: "30px"}}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="pencil" size="xxl" color="#e5740b"/>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiHeaderSectionItem>

              <EuiHeaderSectionItem>
                <EuiTitle style={{paddingLeft: "20px", paddingTop: "20px"}}>
                  <h2>Kibana Comments</h2>
                </EuiTitle>

                <EuiText style={{paddingLeft: "20px"}}>
                  <p>A plugin to add comments to your Kibana dashboards</p>
                </EuiText>

              </EuiHeaderSectionItem>

            </EuiHeaderSection>


          </EuiHeader>
        </EuiPageHeader>

{/*
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiTitle>
              <h2>Add new comment</h2>
            </EuiTitle>
          </EuiPageContentHeader>

          <EuiPageContentBody>
            <NewComment />
          </EuiPageContentBody>
        </EuiPageContent>
*/}
        <EuiSpacer />


        <EuiPageContent>


          <EuiPageContentBody>
            <ListComments />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>

      <EuiSpacer />

{/*
      <EuiPageBody>
        <EuiPageContent verticalPosition="center" horizontalPosition="center">
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiLoadingSpinner size="xl"/>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiPageContentBody>
            Loading...
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
*/}
    {/*<EuiGlobalToastList
      toasts={props.messages}
      toastLifeTimeMs={6000}
      dismissToast={removeToast}
    />*/}

   </EuiPage>
   </Fragment>
  );

};

export default Main
