<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'destructive' | 'success'
  title?: string
  description?: string
  class?: string
}>(), {
  variant: 'default'
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-background text-foreground border-border',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    success: 'bg-green-50 text-green-900 border-green-200'
  }
  return variants[props.variant]
})

const iconClasses = computed(() => {
  const variants = {
    default: 'text-foreground',
    destructive: 'text-destructive',
    success: 'text-green-600'
  }
  return variants[props.variant]
})
</script>

<template>
  <div
    :class="cn(
      'relative w-full rounded-lg border p-4',
      variantClasses,
      props.class
    )"
  >
    <div class="flex gap-3">
      <div v-if="variant === 'destructive'" :class="cn('flex-shrink-0', iconClasses)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" x2="12" y1="8" y2="12"></line>
          <line x1="12" x2="12.01" y1="16" y2="16"></line>
        </svg>
      </div>
      <div v-if="variant === 'success'" :class="cn('flex-shrink-0', iconClasses)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </div>
      <div class="flex-1">
        <h5 v-if="title" class="mb-1 font-medium leading-none tracking-tight">
          {{ title }}
        </h5>
        <div v-if="description" class="text-sm opacity-90">
          {{ description }}
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
