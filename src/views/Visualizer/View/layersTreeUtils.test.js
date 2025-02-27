import { initLayersStateAction,
  selectSublayerAction,
  setLayerStateAction,
  filterLayersFromLayersState,
  hasTable,
  layersTreeStatesHaveChanged } from './layersTreeUtils';

const layersTree = [{
  label: 'label1',
  initialState: {
    active: true,
    opacity: 0.3,
  },
  layers: ['layer1', 'layer2'],
}, {
  group: 'group2',
  layers: [{
    initialState: {
      active: true,
      opacity: 0,
    },
    label: 'label2.1',
    layers: ['layer2.1'],
  }, {
    label: 'label2.2',
    layers: ['layer2.2'],
  }],
}, {
  label: 'label3',
  initialState: {
    active: true,
  },
  sublayers: [{
    label: 'sublayer3.1',
    layers: ['layer3.1'],
  }, {
    label: 'sublayer3.2',
    layers: ['layer3.2'],
  }],
}, {
  group: 'group4',
  layers: [{
    label: 'label4.1',
    initialState: {
      active: false,
    },
    sublayers: [{
      label: 'sublayer4.1.1',
      layers: ['layer4.1.1'],
    }, {
      label: 'sublayer4.1.2',
      layers: ['layer4.1.2'],
    }],
  }, {
    label: 'label4.2',
    initialState: {
      active: false,
    },
    layers: ['layer4.2'],
  }],
}];
const initialLayersTreeState = new Map();
initialLayersTreeState.set(layersTree[0], { active: true, opacity: 0.3 });
initialLayersTreeState.set(layersTree[1].layers[0], { active: true, opacity: 0 });
initialLayersTreeState.set(layersTree[1].layers[1], { active: false, opacity: 1 });
initialLayersTreeState.set(layersTree[2], { active: true, opacity: 1, sublayers: [true, false] });
initialLayersTreeState.set(
  layersTree[3].layers[0],
  { active: false, opacity: 1, sublayers: [false, false] },
);
initialLayersTreeState.set(layersTree[3].layers[1], { active: false, opacity: 1 });

const layersTreeFilters = [{
  label: 'label1',
  initialState: {
    active: true,
    opacity: 0.3,
  },
  layers: ['layer1', 'layer2'],
  filters: { layer: 'layer1', fields: [], form: [] },
}, {
  group: 'group2',
  layers: [{
    initialState: {
      active: false,
      opacity: 0,
    },
    label: 'label2.1',
    layers: ['layer2.1'],
  }, {
    label: 'label2.2',
    layers: ['layer2.2'],
    filters: { layer: 'layer2.2', fields: [], form: [] },
  }],
}, {
  label: 'label3',
  initialState: {
    active: true,
  },
  sublayers: [{
    label: 'sublayer3.1',
    layers: ['layer3.1'],
  }, {
    label: 'sublayer3.2',
    layers: ['layer3.2'],
  }],
}, {
  group: 'group4',
  layers: [{
    initialState: {
      active: true,
      opacity: 0,
    },
    label: 'label4.1',
    layers: ['layer4.1'],
    filters: { layer: 'layer4.1', fields: [], form: [] },
  }, {
    label: 'label2.2',
    layers: ['layer2.2'],
  }],
}];
const layersTreeFilterState = new Map();
layersTreeFilterState.set(layersTreeFilters[0], { active: true });
layersTreeFilterState.set(layersTreeFilters[1].layers[0], { active: true });
layersTreeFilterState.set(layersTreeFilters[1].layers[1], { active: false });
layersTreeFilterState.set(layersTreeFilters[2], { active: true, sublayers: [true, false] });
layersTreeFilterState.set(layersTreeFilters[3].layers[0], { active: true, table: true });
layersTreeFilterState.set(layersTreeFilters[3].layers[1], { active: true });

it('should init layers state', () => {
  const layersTreeState = initLayersStateAction(layersTree);

  expect(layersTreeState).toEqual(initialLayersTreeState);
});


it('should set layer state', () => {
  const newLayersTreeState = setLayerStateAction(
    layersTree[3].layers[0],
    { active: true, table: true },
    initialLayersTreeState,
  );
  expect(newLayersTreeState).not.toBe(initialLayersTreeState);
  expect(newLayersTreeState.get(layersTree[3].layers[0])).toEqual({
    active: true,
    opacity: 1,
    table: true,
    sublayers: [true, false],
  });
});

it('should set layer state and initial sublayers', () => {
  const newLayersTreeState1 = setLayerStateAction(
    layersTree[0],
    { active: false, table: false },
    initialLayersTreeState,
  );
  expect(newLayersTreeState1).not.toBe(initialLayersTreeState);
  expect(newLayersTreeState1.get(layersTree[0])).toEqual({
    active: false,
    opacity: 0.3,
    table: false,
  });

  const newLayersTreeState2 = setLayerStateAction(
    layersTree[0],
    { active: true, opacity: 1, table: true },
    newLayersTreeState1,
  );
  expect(newLayersTreeState2).not.toBe(newLayersTreeState1);
  expect(newLayersTreeState2.get(layersTree[0])).toEqual({
    active: true,
    opacity: 1,
    table: true,
  });

  const newLayersTreeState3 = setLayerStateAction(
    {},
    { active: true, opacity: 1 },
    newLayersTreeState1,
  );
  expect(newLayersTreeState3).toBe(newLayersTreeState3);
});

it('should select sublayer', () => {
  const newLayersTreeState1 = selectSublayerAction(layersTree[2], 0, initialLayersTreeState);

  expect(newLayersTreeState1).not.toBe(initialLayersTreeState);
  expect(newLayersTreeState1.get(layersTree[2])).toEqual({
    active: true,
    opacity: 1,
    sublayers: [true, false],
    table: false,
  });

  const newLayersTreeState2 = selectSublayerAction(layersTree[2], 1, initialLayersTreeState);

  expect(newLayersTreeState2).not.toBe(newLayersTreeState1);
  expect(newLayersTreeState2.get(layersTree[2])).toEqual({
    active: true,
    opacity: 1,
    sublayers: [false, true],
    table: false,
  });
});

it('should return an empty array', () => {
  const activeLayers = filterLayersFromLayersState(
    initialLayersTreeState,
  );
  expect(activeLayers).toEqual([]);
});

it('if have filters, should return an array of active layers', () => {
  const activeLayers = filterLayersFromLayersState(
    layersTreeFilterState,
  );
  expect(activeLayers).toEqual(['layer1', 'layer4.1']);
});

it('should return the layer table state', () => {
  expect(hasTable(layersTreeFilterState)).toBe(true);
});

it('should return true if the layersTree state has changed', () => {
  const newLayersTreeState = setLayerStateAction(
    layersTree[3].layers[0],
    { active: true, table: true },
    initialLayersTreeState,
  );
  expect(layersTreeStatesHaveChanged(newLayersTreeState, initialLayersTreeState)).toBe(true);
});
