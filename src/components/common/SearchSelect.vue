<template>
  <div class="relative">
    <input type="text" :placeholder="placeholder" v-model="query" class="input" @input="onInput" @keydown.enter.prevent="commitFreeInput" @blur="onBlur" />
    <div v-if="open && items.length" class="absolute z-10 mt-1 w-full card p-1 max-h-60 overflow-auto" @keydown.escape="open=false">
      <div ref="listRef" class="relative" :style="{ height: totalHeight + 'px' }" @scroll.passive>
        <div class="absolute left-0 right-0" :style="{ transform: `translateY(${offset}px)` }">
          <div v-for="(opt, i) in visibleItems" :key="i" class="px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer"
               @click="select(opt)">{{ opt.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

type Option = { label: string; value: string }
const props = withDefaults(defineProps<{ placeholder?: string; fetchOptions: (q: string) => Promise<Option[]>; modelValue?: string; allowFreeInput?: boolean }>(), { placeholder: 'Поиск...', allowFreeInput: true })
const emit = defineEmits<{ 'update:modelValue': [string], 'select': [Option] }>()

const query = ref('')
const items = ref<Option[]>([])
const open = ref(false)

const itemHeight = 36
const viewport = 240
const start = ref(0)
const end = ref(0)
const listRef = ref<HTMLDivElement | null>(null)

const totalHeight = computed(() => items.value.length * itemHeight)
const offset = computed(() => start.value * itemHeight)
const visibleItems = computed(() => items.value.slice(start.value, end.value))

const recalc = () => {
  const el = listRef.value
  const scrollTop = (el?.parentElement?.scrollTop ?? 0)
  const first = Math.floor(scrollTop / itemHeight)
  start.value = Math.max(0, first - 2)
  const visibleCount = Math.ceil(viewport / itemHeight) + 4
  end.value = Math.min(items.value.length, start.value + visibleCount)
}

const debouncedFetch = useDebounce(async (q: string) => {
  items.value = await props.fetchOptions(q)
  open.value = true
  recalc()
}, 300)

function onInput() {
  if (props.allowFreeInput) emit('update:modelValue', query.value)
  debouncedFetch(query.value)
}
function select(opt: Option) {
  emit('update:modelValue', opt.value)
  emit('select', opt)
  query.value = opt.label
  open.value = false
}

function commitFreeInput() {
  if (props.allowFreeInput) emit('update:modelValue', query.value)
  open.value = false
}
function onBlur() {
  if (props.allowFreeInput) emit('update:modelValue', query.value)
}

const onScroll = () => recalc()
onMounted(() => {
  listRef.value?.parentElement?.addEventListener('scroll', onScroll)
})
onBeforeUnmount(() => listRef.value?.parentElement?.removeEventListener('scroll', onScroll))

watch(items, () => recalc())
watch(() => props.modelValue, (v) => {
  if (typeof v === 'string' && v && v !== query.value) {
    query.value = v
  }
})
</script>
