import React from 'react';

import { fetchViewConfig } from '../../services/visualizer';
import SearchProvider from '../../components/SearchProvider';
import Loading from '../../components/Loading';
import View from './View';
import NotFound from './NotFound';

import './styles.scss';

export class Visualizer extends React.Component {
  state = {
    loading: true,
  }

  async componentDidMount () {
    this.loadViewConfig();
  }

  componentDidUpdate ({ match: { params: { viewName: prevViewName } } }) {
    const { match: { params: { viewName } } } = this.props;
    if (viewName !== prevViewName) {
      this.loadViewConfig();
    }
  }

  componentWillUnmount () {
    this.isUnmount = true;
  }

  onViewStateUpdate = viewState => {
    const { match: { params: { viewName } } } = this.props;
    this.setState(({ [viewName]: view }) => ({
      [viewName]: {
        ...view,
        state: {
          ...view.state,
          ...viewState,
        },
      },
    }));
  }

  getCurrentViewSetting () {
    const { match: { params: { viewName } } } = this.props;
    const { [viewName]: viewSettings } = this.state;

    return viewSettings;
  }

  async loadViewConfig () {
    const { match: { params: { viewName } } } = this.props;
    this.setState({ loading: true });

    const cached = this.getCurrentViewSetting();
    if (cached) {
      await true; // This await is needed to force a unmount of View component
      this.setState({ loading: false, notfound: false });
      return;
    }
    const viewConfig = await fetchViewConfig(viewName);

    if (this.isUnmount) return;

    if (!viewConfig) {
      this.setState({ notfound: true });
      return;
    }

    this.setState({
      [viewName]: {
        ...viewConfig,
        state: {
          layersTreeState: new Map(),
          query: '',
          table: [],
        },
      },
      notfound: false,
      loading: false,
    });
  }

  render () {
    const { match: { params: { viewName } }, ...props } = this.props;
    const { loading, notfound } = this.state;
    const { onViewStateUpdate } = this;
    const viewSettings = this.getCurrentViewSetting();

    if (notfound) return <NotFound />;

    return (
      <SearchProvider>
        {(loading || !viewSettings)
          ? <Loading />
          : (
            <View
              key={viewName}
              view={viewSettings}
              onViewStateUpdate={onViewStateUpdate}
              {...props}
            />
          )
        }
      </SearchProvider>
    );
  }
}

export default Visualizer;
