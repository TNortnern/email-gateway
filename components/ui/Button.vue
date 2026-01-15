<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
}>(), {
  variant: 'default',
  size: 'default'
})

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm'

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-[0.98]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]',
    outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md',
    ghost: 'hover:bg-accent hover:text-accent-foreground shadow-none',
    link: 'text-primary underline-offset-4 hover:underline shadow-none'
  }

  const sizes = {
    default: 'h-11 px-5 py-2.5',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-12 rounded-lg px-8 text-base',
    icon: 'h-10 w-10'
  }

  return cn(baseClasses, variants[props.variant], sizes[props.size], props.class)
})
</script>

<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>
