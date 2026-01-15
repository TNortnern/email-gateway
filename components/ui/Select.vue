<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

export interface SelectOption {
  label: string
  value: string | number
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  class?: string
}>(), {
  modelValue: '',
  options: () => [],
  placeholder: 'Select an option'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected?.label || props.placeholder
})

const isPlaceholder = computed(() => {
  return !props.modelValue || !props.options.find(opt => opt.value === props.modelValue)
})
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="cn(
        'flex h-11 w-full items-center justify-between rounded-lg border-2 border-input bg-background px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer hover:border-input/80',
        isPlaceholder && 'text-muted-foreground/60',
        props.class
      )"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled hidden>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </div>
</template>
