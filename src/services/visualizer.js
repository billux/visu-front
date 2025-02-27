import { Api } from '@terralego/core';
import { sortCustomLayers } from '@terralego/core/modules/Visualizer/services/layersTreeUtils';

import population from '../images/population.png';
import economie from '../images/economie.png';
import mobilite from '../images/mobilite.png';

// logos path map for view usage.
// This is a quick workaround to be able to choose an icon
// from the backend. Next step is to have a media management
// from admin
const logos = {
  population,
  economie,
  mobilite,
};

export const fetchViewConfig = async viewName => {
  try {
    console.log('loading', viewName);
    const config = await Api.request(`geolayer/view/${viewName}/`);

    // Replace '/api/' part in urls with the API_HOST value to be able to reach the
    // configured backend
    const configWithHost = JSON.parse(JSON.stringify(config).replace(/"\/api(\/[^"]+)"/g, `"${Api.host}$1"`));

    const { layersTree, map: { customStyle: { layers } = {} } = {} } = configWithHost;

    configWithHost.map = configWithHost.map || {};
    configWithHost.map.customStyle = configWithHost.map.customStyle || {};
    configWithHost.map.customStyle.layers = sortCustomLayers(layers, layersTree);

    return configWithHost;
  } catch (e) {
    return null;
  }
};

let viewList = null; // Cache for the view list content

export const fetchViewList = async () => {
  /** Fetch the view list to generate the menu for instance */
  if (viewList === null) {
    const apiViews = await Api.request('geolayer/view/');

    // Object transformation from backend format
    // to frontend one.
    // Should be removed in a future release
    viewList = Object.entries(apiViews)
      .map(([key, { 'icon-name': iconName, 'icon-path': iconPath = logos[iconName], name, ...rest }]) =>
        ({ ...rest, id: `nav-${key}`, key, name, label: name, iconPath, href: `/{{VIEW_ROOT_PATH}}/${key}` }))
      .sort(({ pk: pkA }, { pk: pkB }) => pkA - pkB);
  }

  return viewList;
};

export default { fetchViewConfig, fetchViewList };
