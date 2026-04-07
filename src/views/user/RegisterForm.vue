<template>
  <van-form @submit="onRegister" ref="formRef" class="form">
    <van-cell-group inset>
      <van-field
        v-model="registerForm.username"
        label="用户名"
        placeholder="请输入用户名"
        :rules="rules.username"
      />

      <van-field
        v-model="registerForm.phone"
        label="手机号"
        placeholder="请输入手机号"
        :rules="rules.phone"
      />

      <van-field
        v-model="registerForm.password"
        label="密码"
        :type="showRegisterPassword ? 'text' : 'password'"
        placeholder="请设置密码"
        :rules="rules.password"
      >
        <template #right-icon>
          <van-icon
            :name="showRegisterPassword ? 'eye' : 'eye-o'"
            class="password-toggle-icon"
            @click="toggleRegisterPassword"
          />
        </template>
      </van-field>

      <van-field v-model="registerForm.confirmPassword" label="确认密码"
        :type="showRegisterConfirmPassword ? 'text' : 'password'" placeholder="请确认密码" :rules="rules.confirmPassword">
        <template #right-icon>
          <van-icon
            :name="showRegisterConfirmPassword ? 'eye' : 'eye-o'"
            class="password-toggle-icon"
            @click="toggleRegisterConfirmPassword"
          />
        </template>
      </van-field>

      <van-field
        v-model="registerForm.email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="rules.email"
      />

      <!-- 职能选择 -->
<<<<<<< HEAD
      <van-field v-model="registerForm.roleText" label="职能" placeholder="请选择职能" is-link readonly :rules="rules.role"
        @click="showRolePicker = true" />
=======
      <van-field
        v-model="registerForm.roleText"
        label="职能"
        placeholder="请选择职能"
        is-link
        readonly
        :rules="rules.role"
        @click="showRolePicker = true"
      />
>>>>>>> 61a43874514644d13c9b6660fa4e7beadf03bd6e
      <van-popup v-model:show="showRolePicker" position="bottom">
        <van-picker
          :columns="roleColumns"
          @confirm="onRoleConfirm"
          @cancel="showRolePicker = false"
        />
      </van-popup>
    </van-cell-group>

    <div style="margin: 16px">
      <van-button
        type="primary"
        block
        native-type="submit"
        :loading="registerLoading"
        class="action-btn"
      >
        注册
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import { registerApi } from '@/api/user'

const emit = defineEmits(['switchToLogin'])
const formRef = ref(null)

// 注册表单
const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  email: '',
<<<<<<< HEAD
  nickname: '',
  role: 0,
  roleText: '',
  verifyCode: ''
})

// 加载状态
=======
  nickname: '',        
  role: 0,            
  roleText: ''
})

// UI 状态
>>>>>>> 61a43874514644d13c9b6660fa4e7beadf03bd6e
const registerLoading = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)
const showRolePicker = ref(false)

<<<<<<< HEAD
// ✅ 修复：职能选择数组（正确写法，不是二维数组）
=======
// 职能选项
>>>>>>> 61a43874514644d13c9b6660fa4e7beadf03bd6e
const roleColumns = [
  { text: '老人端', value: 1 },
  { text: '家庭端', value: 2 }
]

// 处理职能选择确认
const onRoleConfirm = (selected) => {
  let selectedValue
  if (selected && typeof selected === 'object') {
    if (Array.isArray(selected)) {
      selectedValue = selected[0]
    } else if (selected.selectedValues) {
      selectedValue = selected.selectedValues[0]
    } else if (selected.value !== undefined) {
      selectedValue = selected.value
    }
  }
  const option = roleColumns.find(item => item.value === selectedValue)
  if (option) {
    registerForm.role = option.value
    registerForm.roleText = option.text
  }
  showRolePicker.value = false
}

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/,
      message: '密码需包含大小写字母和数字，8-20位'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (val) => val === registerForm.password,
      message: '两次输入的密码不一致'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
  ],
  role: [
    { required: true, message: '请选择职能' },
    {
      validator: () => registerForm.role === 1 || registerForm.role === 2,
      message: '请选择有效的职能'
    }
  ]
}

// 切换密码可见性
const toggleRegisterPassword = () => {
  showRegisterPassword.value = !showRegisterPassword.value
}
const toggleRegisterConfirmPassword = () => {
  showRegisterConfirmPassword.value = !showRegisterConfirmPassword.value
}

<<<<<<< HEAD
// ✅ 修复：职能选择确认事件
const handleRoleConfirm = ({ selectedOptions }) => {
  const item = selectedOptions[0]
  registerForm.role = item.value
  registerForm.roleText = item.text
  showRolePicker.value = false
}

=======
>>>>>>> 61a43874514644d13c9b6660fa4e7beadf03bd6e
// 注册提交
const onRegister = async () => {
  try {
    await formRef.value?.validate()
    registerLoading.value = true

<<<<<<< HEAD
    // 过滤掉不需要传给后端的字段
    const { confirmPassword, ...registerData } = registerForm
    const res = await registerApi(registerData)

    if (res.code === 200) {
      showToast('注册成功')
=======
    // nickname 未填，默认用 username
    if (!registerForm.nickname) {
      registerForm.nickname = registerForm.username
    }

    // 移除confirmPassword 和 roleText 字段
    const { confirmPassword, roleText, ...submitData } = registerForm
    // 确保 role 是数字
    submitData.role = Number(submitData.role)

    const res = await registerApi(submitData)
    if (res.code === 200) {
      showToast('注册成功')
      // 清空表单
>>>>>>> 61a43874514644d13c9b6660fa4e7beadf03bd6e
      Object.assign(registerForm, {
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        email: '',
<<<<<<< HEAD
        role: 0,
        roleText: '',
        verifyCode: ''
      })
      emit('switchToLogin')
    } else {
      showToast(res.msg || '注册失败')
=======
        nickname: '',
        role: 0,
        roleText: ''
      })
      // 切换到登录选项卡
      emit('switchToLogin')
    } else {
      showToast(res.msg || res.errorMsg || '注册失败')
>>>>>>> 61a43874514644d13c9b6660fa4e7beadf03bd6e
    }
  } catch (err) {
    console.error('注册失败', err)
    showToast('网络异常，请重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.form {
  padding: 20px;
}
.action-btn {
  margin-top: 20px;
  --van-button-height: 50px;
  height: 50px;
  font-size: 18px;
}
.password-toggle-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 10px;
}
.password-toggle-icon:hover {
  color: #1976d2;
}
</style>