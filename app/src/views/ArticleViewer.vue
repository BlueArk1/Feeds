<template>
  <div class="reader">
    <div class="btns">
      <button class="close" @click="close">← Back</button>
      <button @click="openExternal(articleUrl)">
        View Article
        <img src="/external_link.svg" alt="" srcset="">
      </button>
    </div>


    <div class="meta">
      <div v-if="loading">Loading article…</div>
      <h2 v-if="!loading">{{ title }}</h2>
    </div>
    
    <div 
      v-if="!loading"
      class="content"
      v-html="content"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const encodedUrl = route.params.encodedUrl || ''
const url = decodeURIComponent(encodedUrl)

const articleUrl = ref('')
const title = ref('')
const content = ref('')
const loading = ref(true)

function openExternal(url) {
  window.open(url, "_blank", "noopener");
}

function close() {
  router.push({ name: 'Home' })
};


async function fetchArticle() {
  if (!url) {
    content.value = 'No URL provided.'
    loading.value = false
    return
  }

  try {
    const { data } = await axios.get('/api/article', {
      params: { url }
    })

    articleUrl.value = data.url
    title.value = data.title || 'Untitled Article'
    content.value = data.html || '<p>No content available.</p>'
  } catch (error) {
    console.error(error)
    title.value = 'Error'
    content.value = '<p>Failed to load article.</p>'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticle()
})


</script>

<style scoped>
button {
  display: flex;
  color: whitesmoke;
  gap: 1em;
  background: none;
  border: 1px solid #2b3440;
  padding: 0.8em;
  border-radius: 5px;
  cursor: pointer;
}

.btns{
  display: flex;
  justify-content: space-between;
  margin-bottom: 2em;
}

.reader {
  padding: 1.5rem;
  max-width: 900px;
  background: #121212;
  color: #e6eef8;
}

.close {
  background: none;
  border: 1px solid #2b3440;
  padding: 0.8em;
  border-radius: 4px;
  cursor: pointer;
}

.meta h2 {
  margin: 0.5rem 0 1rem;
  font-size: 1.6rem;
  color: white;
}

.content {
  line-height: 1.7;
  color: #d8e6f3;
  font-size: 1.2rem;
  font-family: 'Roboto';
}
</style>
