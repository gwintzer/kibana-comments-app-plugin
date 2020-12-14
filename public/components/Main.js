import React, {
  Component, Fragment
} from 'react';

import '@elastic/eui/dist/eui_theme_light.css';

import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';


import ListComments from '../components/ListComments'


const Main = (props) => {



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

        <EuiSpacer />

        <EuiPageContent>


          <EuiPageContentBody>
            <ListComments />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>

      <EuiSpacer />

   </EuiPage>
   </Fragment>
  );

};

export default Main
