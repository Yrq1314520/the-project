<template>
  <van-form @submit="onRegister" ref="formRef" class="form">
    <van-cell-group inset>
      <van-field
        v-model="regForm.username"
        label="用户名"
        placeholder="请输入用户名"
        :rules="rules.username"
      />

      <van-field
        v-model="regForm.phone"
        label="手机号"
        placeholder="请输入手机号"
        :rules="rules.phone"
      />

      <van-field
        v-model="regForm.pwd"
        label="密码"
        :type="showRegPwd ? 'text' : 'password'"
        placeholder="请设置密码"
        :rules="rules.pwd"
      >
        <template #right-icon>
          <van-icon
            :name="showRegPwd ? 'eye' : 'eye-o'"
            class="pwd-toggle-icon"
            @click="toggleRegPwd"
          />
        </template>
      </van-field>

      <van-field 
        v-model="regForm.confirmPwd" 
        label="确认密码"
        :type="showRegConfirm ? 'text' : 'password'" 
        placeholder="请确认密码" 
        :rules="rules.confirmPwd"
      >
        <template #right-icon>
          <van-icon
            :name="showRegConfirm ? 'eye' : 'eye-o'"
            class="pwd-toggle-icon"
            @click="toggleRegConfirm"
          />
        </template>
      </van-field>

      <van-field
        v-model="regForm.email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="rules.email"
      />

      <!-- 验证码 -->
      <van-field
        v-model="regForm.verifyCode"
        label="验证码"
        placeholder="请输入验证码"
        :rules="rules.verifyCode"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :disabled="countDown > 0"
            @click="sendVerifyCode"
          >
            {{ countDown > 0 ? `${countDown}s后重发` : '获取验证码' }}
          </van-button>
        </template>
      </van-field>

      <!-- 职能选择 -->
      <van-field
        v-model="regForm.roleText"
        label="职能"
        placeholder="请选择职能"
        is-link
        readonly
        :rules="rules.role"
        @click="showRolePicker = true"
      />
      <van-popup v-model:show="showRolePicker" position="bottom">
        <van-picker
          :columns="roleOptions"
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
        :loading="regLoading"
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
import { registerApi, sendEmailCodeApi } from '@/api/user'

const emit = defineEmits(['switchToLogin'])
const formRef = ref(null)

// 注册表单数据
const regForm = reactive({
  username: '',
  phone: '',
  pwd: '',
  confirmPwd: '',
  email: '',
  verifyCode: '',
  nickname: '',        
  role: 0,            
  roleText: ''
})

const regLoading = ref(false)
const showRegPwd = ref(false)
const showRegConfirm = ref(false)
const showRolePicker = ref(false)
const countDown = ref(0)

// 职能选项
const roleOptions = [
  { text: '老人端', value: 1 },
  { text: '家庭端', value: 2 }
]

// 确认职能
const onRoleConfirm = (selected) => {
  let selectedValue
  // 兼容 vant-picker 返回格式
  if (selected && typeof selected === 'object') {
    if (Array.isArray(selected)) {
      selectedValue = Number(selected[0])
    } else if (selected.selectedValues) {
      selectedValue = Number(selected.selectedValues[0])
    } else if (selected.value !== undefined) {
      selectedValue = Number(selected.value)
    }
  }
  const option = roleOptions.find(item => item.value === selectedValue)
  if (option) {
    regForm.role = option.value
    regForm.roleText = option.text
  }
  showRolePicker.value = false
}

// 校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ],
  pwd: [
    { required: true, message: '请输入密码' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/,
      message: '密码需包含大小写字母和数字，8-20位'
    }
  ],
  confirmPwd: [
    { required: true, message: '请确认密码' },
    {
      validator: (val) => val === regForm.pwd,
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
      validator: () => regForm.role === 1 || regForm.role === 2,
      message: '请选择有效的职能'
    }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码' }
  ]
}

// 密码可见切换
const toggleRegPwd = () => {
  showRegPwd.value = !showRegPwd.value
}
const toggleRegConfirm = () => {
  showRegConfirm.value = !showRegConfirm.value
}

// 发送验证码（注册 type=1）
const sendVerifyCode = async () => {
  if (!regForm.email) {
    showToast('请输入邮箱')
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(regForm.email)) {
    showToast('邮箱格式不正确')
    return
  }
  
  try {
    const res = await sendEmailCodeApi({
      email: regForm.email,
      type: 1
    })
    console.log(res)
    if (res.success === 200) {
      showToast('验证码已发送')
      // 倒计时
      countDown.value = 60
      const timer = setInterval(() => {
        countDown.value--
        if (countDown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      showToast(res.errorMsg || '发送失败')
    }
  } catch (err) {
    console.error('发送验证码失败', err)
    showToast('网络异常，请重试')
  }
}

// 注册提交
const onRegister = async () => {
  try {
    await formRef.value?.validate()
    regLoading.value = true

    // nickname 默认用 username
    if (!regForm.nickname) {
      regForm.nickname = regForm.username
    }
    const { confirmPwd, roleText, ...submitData } = regForm
    submitData.role = Number(submitData.role)

    const res = await registerApi(submitData)
    if (res.success === 200) {
      showToast('注册成功')
      // 清空表单
      Object.assign(regForm, {
        username: '',
        phone: '',
        pwd: '',
        confirmPwd: '',
        email: '',
        verifyCode: '',
        nickname: '',
        role: 0,
        roleText: ''
      })
      countDown.value = 0
      // 切换到登录页
      emit('switchToLogin')
    } else {
      const errorMsg = res.msg || res.errorMsg || '注册失败'
      if (errorMsg.includes('邮箱已被注册')) {
        showToast('该邮箱已被注册，请更换邮箱')
      } else if (errorMsg.includes('用户名已被占用')) {
        showToast('用户名已被占用，请更换用户名')
      } else if (errorMsg.includes('验证码错误')) {
        showToast('验证码错误，请重新输入')
      } else if (errorMsg.includes('密码格式不符合要求')) {
        showToast('密码需包含大小写字母和数字，长度8-20位')
      } else {
        showToast(errorMsg)
      }
    }
  } catch (err) {
    console.error('注册失败', err)
    showToast('网络异常，请重试')
  } finally {
    regLoading.value = false
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
.pwd-toggle-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 10px;
}
.pwd-toggle-icon:hover {
  color: #1976d2;
}
</style>