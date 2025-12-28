<template>
    <header>
      <h1>Feeds</h1>
      <div 
      @click="refreshFeed()"
      class="refresh-btn"><img src="/refresh.svg" alt="" srcset=""></div>
    </header>

    <main>
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'normal' }"
          @click="activeTab = 'normal'"
        >
          News
        </button>
        <button
          :class="{ active: activeTab === 'sensitive' }"
          @click="activeTab = 'sensitive'"
        >
          Sensitive Topics
        </button>
      </div>

      <div class="tab-content">
<Feed
  v-if="activeTab === 'normal'"
  title="News"
  endpoint="/api/news"
  @view-article="openArticle"
/>
<Feed
  v-if="activeTab === 'sensitive'"
  title="Sensitive Topics"
  endpoint="/api/sensitive"
  highlight-keywords
  @view-article="openArticle"
/>

      </div>
    </main>
</template>

<script setup>
import { ref } from 'vue'
import Feed from '../components/Feed.vue'
import axios from 'axios'

const activeTab = ref('normal')


async function refreshFeed(){
  console.log('Refreshing Feed.')
  try {
    await axios.get('/api/refresh')
  } catch (err) {
    console.error(err)
  }
}

</script>

