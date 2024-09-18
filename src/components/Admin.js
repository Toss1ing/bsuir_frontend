import React, { useEffect, useState } from 'react'

const AdminPage = () => {
	// Создаем состояния для хранения данных из localStorage
	const [userId, setUserId] = useState(null)
	const [userToken, setUserToken] = useState(null)

	useEffect(() => {
		const storedId = localStorage.getItem('id')
		const storedToken = localStorage.getItem('token')

		setUserId(storedId)
		setUserToken(storedToken)
	}, [])

	return (
		<div>
			<h1>Main Page</h1>
			<p>Welcome to the main page of the application.</p>
			<div>
				<p>User ID: {userId}</p>
				<p>User Token: {userToken}</p>
			</div>
		</div>
	)
}

export default AdminPage
