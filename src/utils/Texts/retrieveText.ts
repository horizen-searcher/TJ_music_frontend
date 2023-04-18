// 包含Retrieve表单所需的数据类型form，约束rules以及处理函数commit
import {reactive, ref} from "vue";
import {ElMessage, FormInstance} from "element-plus";
import api from "@/service";

export const baseForm = ref<FormInstance>();
export const retrieveData = reactive({
    retrieveForm: {
        userNumber: "",
        password: "",
        checkPassword: "",
        verificationCode: ""
    }
})

export const userNumberCheck =  async(rule: any, value: any, callback: any) => {
    const reg = /\b1[5-9][135]\d{4}\b|\b2[0-3][135]\d{4}\b/ // 考虑2015-2023年
    if (!reg.test(value))
        callback(Error("学号格式错误"))
    else
        callback() // callback回调函数得到的信息将会输出，类似rules里面的message
}
export const pwdCheck =  async(rule: any, value: any, callback: any) => {
    // const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~@#$%*-+=:,\\?[\]{}]).{6,16}$/ // TODO：修改这个正则表达式
    const reg = /\d/
    if (!reg.test(value))
        callback(Error("密码不合法"))
    else
        callback() // callback回调函数得到的信息将会输出，类似rules里面的message
}
const pwdAgainCheck = async(rule: any, value: any, callback: any) => {
    if (retrieveData.retrieveForm.checkPassword != retrieveData.retrieveForm.password)
        callback(Error("两次密码不一致，请检查"))
    else
        callback()
}

export const retrieveRules = reactive ({
    userNumber: [
        {
            required: true,
            trigger: 'blur',
            message: '请输入学号'
        },
        {
            validator: userNumberCheck,
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            trigger: 'blur',
            message: '请输入新密码'
        },
        {   min: 6,
            max: 16,
            message: '长度在 6 到 16 个字符',
            trigger: 'blur'
        },
        {
            validator: pwdCheck, // 检验密码是否合法
            trigger: 'blur'
        }
    ],
    checkPassword: [
        {
            required: true,
            trigger: 'blur',
            message: '请确认新密码'
        },
        {
            validator: pwdAgainCheck, // 检验两次密码是否相同
            trigger: 'blur'
        }
    ],
    verificationCode: [
        {
            required: true,
            trigger: 'blur',
            message: '请输入验证码'
        },
        {
            type: 'string',
            message: '验证码格式错误',
            trigger: 'blur'
        }
    ]
})
export const commitRetrieve = async () => {
    if (!baseForm.value)
        return
    await baseForm.value.validate( async (valid: any) => {
        if (valid) {
            try { // TODO: 剥离checkPassword，使用新的对象进行传送
                const response = await api.postRetrieve(retrieveData.retrieveForm); // 不能传入submitForm！
                console.log(response.data); // TODO：修改成功与失败的判断与后处理
            } catch (error: any) {
                ElMessage.error(error.code+': 提交失败，请检查网络或联系管理员')
            }
        } else {
            ElMessage.error('验证失败，请检查数据是否完整且正确')
        }
    })
}

export const sendRetrieveVRCode = async (userInfo: any): Promise<boolean> => {
    // 由于是异步函数，因此只能使用Promise返回
    if (!baseForm.value)
        return false
    return await baseForm.value.validateField('userNumber', async valid => {
        if (valid) {
            try {
                const response = await api.post_sendRetrieveVRCode(userInfo);
                console.log(response.data);
                ElMessage.success("验证码发送成功，请注意查收")
                return true
            } catch (error: any) {
                ElMessage.error(error.code + ': 提交失败，请检查网络或联系管理员')
                return false
            }
        } else {
            ElMessage.error('验证失败，请检查数据是否完整且正确')
            return false
        }
    })
}
