<template>
  <div class="feed">
    <h2>{{ title }}</h2>
    <div
      v-for="article in articles"
      :key="article.link"
      class="article-card"
      @click="goToArticle(article.link)"
    >
      <div class="article-header">
        <span class="article-title">
          {{ article.title }}
        </span>
        <span class="article-source">{{ getDomain(article.link) }}</span>
      </div>
      <p class="article-preview" v-html="(article.preview)"></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  title: String,
  endpoint: String,
  highlightKeywords: Boolean
})

const router = useRouter()
const articles = ref([])

async function fetchFeed() {
  try {
    const { data } = await axios.get(props.endpoint)
    articles.value = shuffleArray(data)
  } catch (err) {
    console.error(err)
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

onMounted(fetchFeed)



function getDomain(url) {
  try {
    const u = new URL(url)
    return u.hostname.replace('www.', '')
  } catch {
    return url
  }
}

function goToArticle(link) {
  const encoded = encodeURIComponent(link)
  router.push({ name: 'article', params: { encodedUrl: encoded } })
}

</script>
