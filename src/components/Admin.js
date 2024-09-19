import axios from 'axios'
import React, { useEffect, useState } from 'react'
import '../css/admin.css'

const API_BASE_URL = `http://localhost:8080/api/v1/admin/all`
const API_DELETE_URL = `http://localhost:8080/api/v1/admin/delete`
const API_MAKE_ADMIN_URL = `http://localhost:8080/api/v1/admin/add`
const API_REMOVE_ADMIN_URL = `http://localhost:8080/api/v1/admin/remove`

const AdminPage = () => {
	const [users, setUsers] = useState([])

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(API_BASE_URL, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
				setUsers(response.data)
			} catch (error) {
				console.error('Error fetching users:', error)
			}
		}

		fetchUsers()
	}, [])

	const handleDeleteUser = async userId => {
		try {
			console.log('Attempting to delete user with ID:', userId)
			await axios.delete(`${API_DELETE_URL}/${userId}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
		} catch (error) {
			console.error('Error deleting user:', error)
		}
	}

	const handleMakeAdmin = async userId => {
		try {
			console.log('Attempting to make user admin with ID:', userId)
			await axios.post(
				`${API_MAKE_ADMIN_URL}/${userId}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)
			setUsers(prevUsers =>
				prevUsers.map(user =>
					user.id === userId
						? { ...user, roles: [...user.roles, { name: 'ROLE_ADMIN' }] }
						: user
				)
			)
		} catch (error) {
			console.error('Error making user admin:', error)
		}
	}

	const handleRemoveAdmin = async userId => {
		try {
			console.log('Attempting to remove admin role from user with ID:', userId)
			await axios.post(
				`${API_REMOVE_ADMIN_URL}/${userId}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)
			// Update users state to remove admin role
			setUsers(prevUsers =>
				prevUsers.map(user =>
					user.id === userId
						? {
								...user,
								roles: user.roles.filter(role => role.name !== 'ROLE_ADMIN'),
						  }
						: user
				)
			)
		} catch (error) {
			console.error('Error removing admin role:', error)
		}
	}

	return (
		<div className='admin-page'>
			<h1>Admin Page</h1>
			<div className='user-grid'>
				{users.length > 0 ? (
					<table>
						<thead>
							<tr>
								<th>Login</th>
								<th>Email</th>
								<th>Roles</th>
								<th>Actions</th>
								<th>Delete User</th>
							</tr>
						</thead>
						<tbody>
							{users.map(user => (
								<tr key={user.id}>
									<td>{user.login}</td>
									<td>{user.email}</td>
									<td>{user.roles.map(role => role.name).join(', ')}</td>
									<td>
										{!user.roles.some(role => role.name === 'ROLE_ADMIN') && (
											<button
												className='admin-button'
												onClick={() => handleMakeAdmin(user.id)}
											>
												Make Admin
											</button>
										)}
										{user.roles.some(role => role.name === 'ROLE_ADMIN') && (
											<button
												className='admin-button'
												onClick={() => handleRemoveAdmin(user.id)}
											>
												Remove Admin
											</button>
										)}
									</td>
									<td>
										<button
											className='delete-button'
											onClick={() => handleDeleteUser(user.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<p>No users found</p>
				)}
			</div>
		</div>
	)
}

export default AdminPage
