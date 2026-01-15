<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline'
  class?: string
}>(), {
  variant: 'default'
})

const variantClasses = computed(() => {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    success: 'border-transparent bg-green-100 text-green-800',
    destructive: 'border-transparent bg-destructive/10 text-destructive',
    warning: 'border-transparent bg-yellow-100 text-yellow-800',
    outline: 'text-foreground'
  }
  return variants[props.variant]
})
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      variantClasses,
      props.class
    )"
  >
    <slot />
  </span>
</template>
