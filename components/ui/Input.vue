<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  type?: string
  modelValue?: string | number
  placeholder?: string
  class?: string
  disabled?: boolean
}>(), {
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn(
      'flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2.5 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 hover:border-input/80',
      props.class
    )"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
