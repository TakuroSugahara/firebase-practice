import firebase from '../plugins/firebase'

export const state = () => ({
  isAuth: false,
  userId: '',
  email: '',
  token: null,
  emailVerified: false
})

export const mutations = {
  setUserId(state, userId) {
    state.userId = userId
  },
  setEmail(state, email) {
    state.email = email
  },
  setAuth(state, isAuth) {
    state.isAuth = isAuth
  },
  setToken(state, token) {
    state.token = token
  },
  setEmailVerified(state, emailVerified) {
    state.emailVerified = emailVerified
  }
}

export const getters = {
  isAuth(state) {
    return state.isAuth && state.emailVerified
  },
  getUserId(state) {
    return state.userId
  },
  getEmail(state) {
    return state.email
  },
  getToken(state) {
    return state.token
  },
  emailVerified(state) {
    return state.emailVerified
  }
}

const alertMessage = (errorCode, errorMessage) => {
  switch (errorCode) {
    case 'auth/wrong-password':
      alert('パスワードが違います')
      return
    case 'auth/invalid-email':
      alert('無効のメールアドレスです')
      return
    case 'auth/user-not-found':
      alert('ユーザーが存在しません')
      return
    case 'auth/weak-password':
      alert('6文字以上でパスワードを設定してください')
      return
    case 'auth/email-already-in-use':
      alert('すでに存在しているメールアドレスです')
      return
    default:
      alert(errorMessage)
  }
}

export const actions = {
  async createUser({ commit, dispatch }, { email, password }) {
    const auth = firebase.auth()

    try {
      await auth.createUserWithEmailAndPassword(email, password)
      commit('setEmail', email)
    } catch (error) {
      // すでに存在している場合は、次のアカウント登録へ
      if (error.code === 'auth/email-already-in-use') {
        await Promise.resolve()
      } else {
        alertMessage(error.code, error.message)
        throw new Error(error)
      }
    }
  },
  async updateEmail({ dispatch, getters }, { email, password }) {
    const user = firebase.auth().currentUser
    // メールアドレス更新には最新のログイン情報が必要
    // https://firebase.google.com/docs/auth/web/manage-users?hl=ja#set_a_users_email_address
    await user.updateEmail(email)
    await dispatch('confirmEmail')
    // メール認証のためにログアウトるする
    await dispatch('firebaseLogout')
  },
  async confirmEmail(context, url) {
    const user = firebase.auth().currentUser
    const settings = {}
    if (url) {
      settings.url = url
    }
    await user.sendEmailVerification(settings)
  },
  async firebaseLogin({ commit, dispatch }, params) {
    await firebase
      .auth()
      .signInWithEmailAndPassword(params.email, params.password)
      .then((userCredencial) => {
        if (!userCredencial.user) {
          throw new Error('not exist user')
        }
        dispatch('setAuthUser', userCredencial.user)
        Promise.resolve()
      })
      .catch((err) => {
        alertMessage(err.code, err.message)
        throw new Error(err)
      })
    const user = firebase.auth().currentUser
    const token = await user.getIdToken()
    commit('setToken', token)
  },
  setAuthenticated({ commit, dispatch }) {
    return new Promise((resolve) => {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          const token = await user.getIdToken()
          commit('setToken', token)
          dispatch('setAuthUser', user)
        }
        resolve(user || false)
      })
    })
  },
  async deleteAuth({ dispatch }, { email, password }) {
    await dispatch('firebaseLogin', { email, password })
    const user = firebase.auth().currentUser
    await user.delete()
  },
  async firebaseLogout({ dispatch, commit }) {
    dispatch('setAuthUser', false)
    commit('setToken', null)
    await firebase.auth().signOut()
  },
  // パスワードの再設定
  async sendResetPassword({ getters }, email) {
    const auth = firebase.auth()
    const resetEmail = email || getters.getEmail

    try {
      await auth.sendPasswordResetEmail(resetEmail)
    } catch (error) {
      alertMessage(error.code, error.message)
      throw new Error(error)
    }
  },
  setAuthUser({ commit }, user) {
    if (user) {
      commit('setUserId', user.uid)
      commit('setEmail', user.email)
      commit('setEmailVerified', user.emailVerified)
      commit('setAuth', true)
    } else {
      commit('setUserId', '')
      commit('setEmail', '')
      commit('setEmailVerified', false)
      commit('setAuth', false)
    }
  }
}
