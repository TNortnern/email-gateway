<template>
  <div class="code-block-container">
    <div class="code-block-header">
      <span class="code-block-title">{{ title }}</span>
      <button @click="copyCode" class="copy-button" :class="{ copied }">
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
    <div class="code-block-content">
      <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  code: string
  language: string
  title?: string
}>()

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = props.code
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// Simple syntax highlighting
const highlightedCode = computed(() => {
  let code = props.code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  if (props.language === 'bash' || props.language === 'shell') {
    // Highlight bash/curl commands
    code = code
      .replace(/(curl|https?:\/\/[^\s]+)/g, '<span class="token url">$1</span>')
      .replace(/(-[A-Za-z]|--[a-z-]+)/g, '<span class="token flag">$1</span>')
      .replace(/('([^']*)'|"([^"]*)")/g, '<span class="token string">$1</span>')
      .replace(/\\\s*$/gm, '<span class="token escape">\\</span>')
  } else if (props.language === 'javascript' || props.language === 'js') {
    // Highlight JavaScript
    code = code
      .replace(/\b(const|let|var|function|async|await|return|if|else|for|while|import|export|from|new)\b/g, '<span class="token keyword">$1</span>')
      .replace(/\b(fetch|console|log|JSON|stringify|parse)\b/g, '<span class="token function">$1</span>')
      .replace(/('([^']*)'|"([^"]*)")/g, '<span class="token string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="token comment">$1</span>')
  } else if (props.language === 'json') {
    // Highlight JSON
    code = code
      .replace(/"([^"]+)":/g, '<span class="token property">"$1"</span>:')
      .replace(/:\s*"([^"]*)"/g, ': <span class="token string">"$1"</span>')
      .replace(/:\s*(\d+)/g, ': <span class="token number">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="token boolean">$1</span>')
  }

  return code
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

.code-block-container {
  margin: 32px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 217, 255, 0.2);
  background: rgba(15, 20, 32, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.code-block-container:hover {
  border-color: rgba(0, 217, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 217, 255, 0.1);
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 217, 255, 0.1);
}

.code-block-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 6px;
  color: #00d9ff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover {
  background: rgba(0, 217, 255, 0.2);
  border-color: rgba(0, 217, 255, 0.4);
  transform: translateY(-1px);
}

.copy-button.copied {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.code-block-content {
  padding: 24px;
  overflow-x: auto;
}

.code-block-content pre {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: #e2e8f0;
}

.code-block-content code {
  font-family: inherit;
}

/* Syntax Highlighting */
:deep(.token.keyword) {
  color: #c792ea;
  font-weight: 500;
}

:deep(.token.function) {
  color: #82aaff;
}

:deep(.token.string) {
  color: #c3e88d;
}

:deep(.token.number) {
  color: #f78c6c;
}

:deep(.token.boolean) {
  color: #ff5370;
}

:deep(.token.comment) {
  color: #546e7a;
  font-style: italic;
}

:deep(.token.property) {
  color: #00d9ff;
}

:deep(.token.url) {
  color: #89ddff;
}

:deep(.token.flag) {
  color: #c792ea;
}

:deep(.token.escape) {
  color: #89ddff;
}

/* Scrollbar */
.code-block-content::-webkit-scrollbar {
  height: 8px;
}

.code-block-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.code-block-content::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.2);
  border-radius: 4px;
}

.code-block-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 217, 255, 0.3);
}
</style>
