<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number
  class?: string
  disabled?: boolean
}>(), {
  rows: 3
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :class="cn(
      'flex min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 hover:border-input/80 resize-y',
      props.class
    )"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
