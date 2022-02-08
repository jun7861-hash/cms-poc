import React, { useState, useEffect } from 'react'
import { CSpinner } from '@coreui/react'
import { useDispatch } from 'react-redux'
import { uamSignIn } from 'core/services/token'
import { loginWithEmailAndPassword } from 'core/services/user'
import { isNotEmptyObject } from 'core/helpers'
import * as masterActions from 'store/master/actions'

const UAMSignIn = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const user_id = params.get('user_id')
    const token = params.get('token')
    const platform = params.get('platform')

    user_id && token && handleRedirection(user_id, token, platform)
  }, []) /* eslint-disable-line */

  const handleRedirection = async (user_id, token, platform) => {
    try {
      setLoading(true)
      const res = await uamSignIn(user_id, token, platform)
      if (res.successful) {
        const data = {
          refreshToken: res.refreshToken,
          token: res.token,
          userId: res.userId
        }
        localStorage.setItem('userToken', JSON.stringify(data));
        localStorage.setItem('quill_type', 'uam');
        const userInfo = await loginWithEmailAndPassword();
        if (isNotEmptyObject(userInfo) && userInfo.user_id) {
          dispatch(masterActions.updateUser(userInfo))
          window.location.href = '/articles'
        } else {
          alert("Invalid user")
        }
      } else {
        console.log(res.message)
      }
    } catch(error) {
      console.log(error)
    }
    setLoading(false)
  }

  return loading && <CSpinner color="secondary" size="lg" className="screen-loading" />
}

export default UAMSignIn
