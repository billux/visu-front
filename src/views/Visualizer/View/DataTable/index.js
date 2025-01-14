import DataTable from './DataTable';
import { connectView } from '../context';

export default connectView(({ layersTreeState, query, map, visibleBoundingBox }) => ({
  query,
  map,
  visibleBoundingBox,
  displayedLayer: Array
    .from(layersTreeState)
    .filter(([, { table }]) => table)
    .map(([layer, state]) => ({ ...layer, state }))[0],
}))(DataTable);
