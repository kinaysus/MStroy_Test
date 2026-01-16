<template>
  <ag-grid-vue
    class="ag-theme-alpine"
    style="width: 100%; height: 600px"
    :columnDefs="columnDefs"
    :autoGroupColumnDef="autoGroupColumnDef"
    :rowData="rowData"
    :treeData="true"
    :getDataPath="getDataPath"
    :groupDefaultExpanded="-1"
  />
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import { computed } from 'vue'
import { TreeStore, TreeItem } from '@/store/TreeStore'

const props = defineProps<{
  items: TreeItem[]
}>()

const store = new TreeStore(props.items)

const rowData = computed(() => store.getAll())

const getDataPath = (data: TreeItem) =>
  store.getAllParents(data.id).map(i => i.label).reverse()

const autoGroupColumnDef = {
  headerName: 'Название',
  cellRendererParams: {
    suppressCount: true
  }
}

const columnDefs = [
  {
    headerName: '№ п/п',
    valueGetter: (params: any) => params.node.rowIndex + 1,
    width: 80
  },
  {
    headerName: 'Категория',
    valueGetter: (params: any) =>
      store.getChildren(params.data.id).length
        ? 'Группа'
        : 'Элемент'
  }
]
</script>
