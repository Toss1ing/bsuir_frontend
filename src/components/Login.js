import axios from 'axios'
import React, { useState } from 'react'
import '../css/login.css'

const API_BASE_URL = 'http://localhost:8080/api/v1/auth'

const LoginPage = ({ formType, setFormType }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		login: '',
		phoneNumber: '',
	})
	const [error, setError] = useState('')
	const [showError, setShowError] = useState(false)

	const handleInputChange = e => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
	}

	const handleSubmit = async e => {
		e.preventDefault()

		const dataToSend =
			formType === 'register'
				? {
						email: formData.email,
						password: formData.password,
						login: formData.login,
						phoneNumber: formData.phoneNumber,
				  }
				: {
						email: formData.email,
						password: formData.password,
				  }

		const url =
			formType === 'register'
				? `${API_BASE_URL}/register`
				: `${API_BASE_URL}/login`

		try {
			const response = await axios.post(url, dataToSend, {
				headers: {
					'Content-Type': 'application/json',
				},
			})

			localStorage.setItem('id', response.data.id)
			localStorage.setItem('token', response.data.token)

			setError('')
			setShowError(false)

			const userRoles = response.data.roles

			const roleNames = userRoles.map(role => role.roleName)

			if (formType === 'login' && roleNames.includes('ROLE_ADMIN')) {
				window.location.href = '/admin'
			} else if (formType === 'login') {
				window.location.href = '/user'
			}
		} catch (error) {
			const errors = error.response?.data?.errors || {}
			const errorMessages = Object.entries(errors).map(
				([field, message]) => `${field}: ${message}`
			)

			setError(
				'Error: ' +
					(error.response?.data?.message + ' ' + errorMessages.join(', ') ||
						'Something went wrong')
			)
			setShowError(true)

			setTimeout(() => {
				setShowError(false)
			}, 3000)
		}
	}

	const handleSwitchForm = () => {
		setFormType(prevType => (prevType === 'login' ? 'register' : 'login'))
	}

	return (
		<div className='container'>
			<h2>{formType === 'register' ? 'Registration' : 'Login'}</h2>
			<form onSubmit={handleSubmit}>
				{formType === 'register' && (
					<>
						<input
							type='text'
							name='login'
							value={formData.login}
							onChange={handleInputChange}
							placeholder='Login'
							required
						/>
						<input
							type='text'
							name='phoneNumber'
							value={formData.phoneNumber}
							onChange={handleInputChange}
							placeholder='Phone number'
							required
						/>
					</>
				)}
				<input
					type='email'
					name='email'
					value={formData.email}
					onChange={handleInputChange}
					placeholder='Email'
					required
				/>
				<input
					type='password'
					name='password'
					value={formData.password}
					onChange={handleInputChange}
					placeholder='Password'
					required
				/>
				<button type='submit'>
					{formType === 'register' ? 'Sign up' : 'Login'}
				</button>
			</form>

			{showError && <div className='error-popup'>{error}</div>}

			<button id='switchButton' onClick={handleSwitchForm}>
				{formType === 'login' ? 'Sign up' : 'Login'}
			</button>
		</div>
	)
}

export default LoginPage
