<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Table } from 'ant-design-vue'
import { Tag, Spin, Avatar, Divider, Card, Input, Tooltip } from 'ant-design-vue'
import { PhoneOutlined, MailOutlined, UserOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons-vue'
import moment from 'moment'
import type { Lead } from './lead.types'

const spinning = ref<boolean>(true)
const dataSource = ref<Lead[]>([])

const columns = ref([
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Бюджет',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Ответственный',
    dataIndex: 'responsible',
    key: 'responsible',
  },
  {
    title: 'Дата создания',
    dataIndex: 'created_at',
    key: 'created_at',
  },
])
const inputValue = ref('')

const fetchLeads = async (query?: string) => {
  try {
    spinning.value = true

    let url = `http://localhost:3000/leads`

    if (query && query.length >= 3) {
      url += `?query=${query}`
    }

    const response = await axios.get(url)
    if (!response.data.length) {
      dataSource.value = []
    } else {
      const leads = response.data.map((lead: any) => ({
        key: lead.id,
        name: lead.name,
        price: lead.price,
        status: {
          id: lead.status.id,
          name: lead.status.name,
          color: lead.status.color,
        },
        responsible: lead.responsible_user.name,
        created_at: moment(lead.created_at * 1000).format('DD.MM.YYYY HH:mm'),
        contacts: lead.contacts,
      }))

      dataSource.value = leads
    }
    spinning.value = false
  } catch (error) {
    console.error('Ошибка при получении данных: ', error)
  }
}

const handlePressEnter = async () => {
  if (inputValue.value.length >= 3) {
    await fetchLeads(inputValue.value)
  }
}

const handleChange = async () => {
  if (inputValue.value.length === 0) {
    await fetchLeads()
  }
}

onMounted(() => {
  fetchLeads()
})
</script>

<template>
  <Card title="Пример тестового задания" :bordered="false">
    <template #extra>
      <div class="lead-search-input">
        <template v-if="inputValue.length < 3 && inputValue.length > 0">
          <Tooltip>
            <template #title>Поиск работает от 3 символов</template>
            <WarningOutlined :style="{ color: '#faad14', fontSize: '18px' }" />
          </Tooltip>
        </template>
        <Input
          v-model:value="inputValue"
          placeholder="Найти..."
          type="text"
          style="margin-left: 10px"
          @pressEnter="handlePressEnter"
          @change="handleChange"
        >
          <template #suffix>
            <SearchOutlined :style="{ color: 'gray' }" />
          </template>
        </Input>
      </div>
    </template>
    <main>
      <Spin :spinning="spinning">
        <Table :dataSource="dataSource" :columns="columns" :pagination="false" :expandRowByClick="true">
          <template #bodyCell="{ column, text }">
            <template v-if="column.key === 'price'">
              {{ Number(text).toLocaleString('ru-RU') }}
            </template>
            <template v-if="column.key === 'status'">
              <Tag :key="text.id" :bordered="false" :color="text.color" class="lead-tag">
                {{ text.name }}
              </Tag>
            </template>
            <template v-if="column.key === 'responsible'">
              <Avatar size="small" :style="{ backgroundColor: '#1890ff' }">
                <template #icon><UserOutlined /></template>
              </Avatar>
              <span class="contact-name">{{ text }}</span>
            </template>
          </template>
          <template #expandedRowRender="{ record }">
            <div v-if="record.contacts.length > 0">
              <div class="contact-box" v-for="contact in record.contacts" :key="contact.id">
                <Avatar size="small">
                  <template #icon><UserOutlined /></template>
                </Avatar>
                <span class="contact-name">{{ contact.name }}</span>
                <ul class="contact-list" v-if="contact.phone || contact.email">
                  <li v-if="contact.phone">
                    <a :href="`tel:${contact.phone}`"><PhoneOutlined /></a>
                  </li>
                  <Divider type="vertical" />
                  <li v-if="contact.email">
                    <a :href="`mailto:${contact.email}`"><MailOutlined /></a>
                  </li>
                </ul>
                <span v-else class="contact-name">без контакта</span>
              </div>
            </div>
            <div class="contact-box" v-else>
              <span class="contact-name">Без контакта</span>
            </div>
          </template>
        </Table>
      </Spin>
    </main>
  </Card>
</template>

<style scoped>
.contact-box {
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-left: 20px;
}

.contact-box > .contact-list {
  display: flex;
  align-items: center;
  list-style-type: none;
  margin: 0;
  margin-left: 10px;
  padding: 0;
}
.contact-name {
  margin-left: 10px;
}
.lead-search-input {
  display: flex;
  align-items: center;
}
.lead-tag {
  color: black;
}
</style>
