'use strict';

import arrayContains from 'terriajs/lib/Core/arrayContains';
import Branding from 'terriajs/lib/ReactViews/Branding.jsx';
import FeatureInfoPanel from 'terriajs/lib/ReactViews/FeatureInfo/FeatureInfoPanel.jsx';
import knockout from 'terriajs-cesium/Source/ThirdParty/knockout';
import MapNavigation from 'terriajs/lib/ReactViews/Map/MapNavigation.jsx';
import MobileHeader from 'terriajs/lib/ReactViews/Mobile/MobileHeader.jsx';
import ModalWindow from 'terriajs/lib/ReactViews/ModalWindow.jsx';
import Notification from 'terriajs/lib/ReactViews/Notification/Notification.jsx';
import MapInteractionWindow from 'terriajs/lib/ReactViews/Notification/MapInteractionWindow.jsx';
import ObserveModelMixin from 'terriajs/lib/ReactViews/ObserveModelMixin';
import React from 'react';
import SidePanel from 'terriajs/lib/ReactViews/SidePanel.jsx';
import ProgressBar from 'terriajs/lib/ReactViews/ProgressBar.jsx';
import BottomDock from 'terriajs/lib/ReactViews/BottomDock/BottomDock.jsx';
import TerriaViewerWrapper from 'terriajs/lib/ReactViews/TerriaViewerWrapper.jsx';

var UserInterface = React.createClass({
    propTypes: {
        terria: React.PropTypes.object,
        allBaseMaps: React.PropTypes.array,
        viewState: React.PropTypes.object
    },

    mixins: [ObserveModelMixin],

    getInitialState() {
        return {
            // True if the feature info panel is visible.
            featureInfoPanelIsVisible: false,

            // True if the feature info panel is collapsed.
            featureInfoPanelIsCollapsed: false,

            useMobileInterface: this.shouldUseMobileInterface()
        };
    },

    componentWillMount() {
        this.pickedFeaturesSubscription = knockout.getObservable(this.props.terria, 'pickedFeatures').subscribe(() => {
            this.setState({
                featureInfoPanelIsVisible: true,
                featureInfoPanelIsCollapsed: false
            });
        }, this);

        const that = this;

        // TO DO(chloe): change window into a container
        this.dragOverListener = e => {
            if (!e.dataTransfer.types || !arrayContains(e.dataTransfer.types, 'Files')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            that.acceptDragDropFile();
        };

        window.addEventListener('dragover', this.dragOverListener, false);

        this.resizeListener = () => {
            var useMobileInterface = this.shouldUseMobileInterface();
            if (useMobileInterface !== this.state.useMobileInterface) {
                this.setState({
                    useMobileInterface: useMobileInterface
                });
            }
        };

        window.addEventListener('resize', this.resizeListener, false);
    },

    componentWillUnmount() {
        this.pickedFeaturesSubscription.dispose();
        window.removeEventListener('resize', this.resizeListener, false);
        window.removeEventListener('dragover', this.dragOverListener, false);
    },

    /**
     * Closes the current notification.
     */
    closeNotification() {
        this.props.viewState.notifications.splice(0, 1);
    },

    /**
     * Show feature info panel.
     */
    closeFeatureInfoPanel(){
        this.setState({
            featureInfoPanelIsVisible: false
        });
    },

    /**
     * Opens the explorer panel to show the welcome page.
     * @return {[type]} [description]
     */
    showWelcome() {
        this.props.viewState.openWelcome();
    },

    /**
     * Changes the open/collapse state of the feature info panel.
     */
    changeFeatureInfoPanelIsCollapsed() {
        this.setState({
            featureInfoPanelIsCollapsed: !this.state.featureInfoPanelIsCollapsed
        });
    },

    acceptDragDropFile(){
        this.props.viewState.openUserData();
        this.props.viewState.isDraggingDroppingFile = true;
    },

    shouldUseMobileInterface() {
        // 640 must match the value of the $sm SASS variable.
        return document.body.clientWidth < 640;
    },

    render(){
        const terria = this.props.terria;
        const allBaseMaps = this.props.allBaseMaps;

        return (
            <div>
                <div className="ui">
                    <div className="ui-inner">
                        <If condition={!this.props.viewState.isMapFullScreen && !this.props.viewState.hideMapUi()}>
                            <If condition={this.state.useMobileInterface}>
                                <MobileHeader terria={terria} viewState={this.props.viewState}/>
                            </If>
                            <div className='workbench'>
                                <Branding onClick={this.showWelcome}
                                          terria={terria}
                                />
                                {!this.state.useMobileInterface && <SidePanel terria={terria}
                                                                              viewState={this.props.viewState}
                                />}
                            </div>
                        </If>
                        <section className="map">
                            <div>
                                <ProgressBar terria={terria}/>
                                <TerriaViewerWrapper terria={this.props.terria} viewState={this.props.viewState}/>
                                <If condition={!this.props.viewState.hideMapUi()}>
                                    <BottomDock terria={terria} viewState={this.props.viewState}/>
                                </If>
                            </div>
                        </section>
                    </div>
                </div>

                <main>
                    {!this.state.useMobileInterface && <ModalWindow terria={terria}
                                                                    viewState={this.props.viewState}
                    />}
                </main>
                <If condition={!this.props.viewState.hideMapUi()}>
                    <div id="map-nav">
                        <MapNavigation terria={terria}
                                       viewState={this.props.viewState}
                                       allBaseMaps={allBaseMaps}
                        />
                    </div>
                </If>
                <div id='notification'>
                    <Notification notification={this.props.viewState.getNextNotification()}
                                  onDismiss={this.closeNotification}
                    />
                    <MapInteractionWindow terria={terria}/>
                </div>
                <FeatureInfoPanel terria={terria}
                                  viewState={this.props.viewState}
                                  isVisible={this.state.featureInfoPanelIsVisible && this.props.viewState.showUi()}
                                  onClose={this.closeFeatureInfoPanel}
                                  isCollapsed={this.state.featureInfoPanelIsCollapsed}
                                  onChangeFeatureInfoPanelIsCollapsed={this.changeFeatureInfoPanelIsCollapsed}
                />
            </div>
        );
    }
});


module.exports = UserInterface;
