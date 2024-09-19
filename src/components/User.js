import axios from 'axios'
import React, { useEffect, useState } from 'react'
import '../css/user.css'

const API_BASE_URL = `http://localhost:8080/api/v1/user/get/task/${localStorage.getItem(
	'id'
)}`
const API_DELETE_URL = `http://localhost:8080/api/v1/user/delete/task/id`
const API_COMPLETE_URL = `http://localhost:8080/api/v1/user/task/complete`
const API_CREATE_URL = `http://localhost:8080/api/v1/user/add/task`
const API_ADD_TASK_URL = `http://localhost:8080/api/v1/user/add/task/${localStorage.getItem(
	'id'
)}`
const API_UPDATE_TASK_URL = `http://localhost:8080/api/v1/user/task/edit`

const UserPage = () => {
	const [tasks, setTasks] = useState([])
	const [statusFilter, setStatusFilter] = useState('all')
	const [dateFilter, setDateFilter] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [isSortingAsc, setIsSortingAsc] = useState(true)
	const [editingTaskId, setEditingTaskId] = useState(null)

	const [newTask, setNewTask] = useState({
		name: '',
		description: '',
		endDate: '',
	})

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const response = await axios.get(API_BASE_URL, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
				setTasks(response.data)
			} catch (error) {
				console.error('Error fetching tasks', error)
			}
		}

		fetchTasks()
	}, [])

	const filteredTasks = tasks.filter(task => {
		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'complete' && task.complete) ||
			(statusFilter === 'pending' && !task.complete)

		const matchesDate =
			!dateFilter || new Date(task.endDate) <= new Date(dateFilter)

		const matchesSearch = task.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase())

		return matchesStatus && matchesDate && matchesSearch
	})

	const handleDelete = async id => {
		try {
			const response = await axios.delete(`${API_DELETE_URL}/${id}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			if (response.status === 200 || response.status === 204) {
				setTasks(tasks.filter(task => task.id !== id))
				console.log(`${API_DELETE_URL}/${id}`)
			}
		} catch (error) {
			console.error('Error deleting task', error)
		}
	}

	const handleStatusChange = async id => {
		try {
			const updatedTasks = tasks.map(task =>
				task.id === id ? { ...task, complete: !task.complete } : task
			)

			setTasks(updatedTasks)

			await axios.put(
				`${API_COMPLETE_URL}/${id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)
		} catch (error) {
			console.error('Error updating task status', error)

			setTasks(prevTasks =>
				prevTasks.map(task =>
					task.id === id ? { ...task, complete: !task.complete } : task
				)
			)
		}
	}

	const handleCreateTask = async e => {
		e.preventDefault()

		const formattedEndDate = new Date(newTask.endDate).toISOString()

		newTask.endDate = formattedEndDate

		try {
			const response = await axios.post(API_CREATE_URL, newTask, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})

			await axios.post(
				`${API_ADD_TASK_URL}/${response.data.id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)

			setTasks([...tasks, response.data])
			setNewTask({ name: '', description: '', endDate: '' })
		} catch (error) {
			console.error('Error creating task', error)
		}
	}

	const handleSortByDate = () => {
		const sortedTasks = [...tasks].sort((a, b) => {
			const dateA = new Date(a.endDate)
			const dateB = new Date(b.endDate)
			return isSortingAsc ? dateA - dateB : dateB - dateA
		})

		setTasks(sortedTasks)
		setIsSortingAsc(!isSortingAsc)
	}

	const handleEditTask = id => {
		setEditingTaskId(id)
	}

	const handleSaveEdit = async task => {
		const formattedEndDate = new Date(task.endDate).toISOString()

		task.endDate = formattedEndDate

		try {
			await axios.post(`${API_UPDATE_TASK_URL}/${task.id}`, task, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			setEditingTaskId(null)
		} catch (error) {
			console.error('Error updating task', error)
		}
	}

	const handleChangeTask = (id, key, value) => {
		const updatedTasks = tasks.map(task =>
			task.id === id ? { ...task, [key]: value } : task
		)
		setTasks(updatedTasks)
	}

	return (
		<div className='user-page'>
			<h1>Tasks</h1>
			<div className='add-form'>
				<form onSubmit={handleCreateTask} className='task-form'>
					<label>
						Task name:{' '}
						<input
							type='text'
							value={newTask.name}
							onChange={e => setNewTask({ ...newTask, name: e.target.value })}
							required
						/>
					</label>
					<label>
						Description:{' '}
						<input
							type='text'
							value={newTask.description}
							onChange={e =>
								setNewTask({ ...newTask, description: e.target.value })
							}
							required
						/>
					</label>
					<label>
						End date:{' '}
						<input
							type='date'
							value={newTask.endDate}
							onChange={e =>
								setNewTask({ ...newTask, endDate: e.target.value })
							}
							required
						/>
					</label>
					<button type='submit'>Add task</button>
				</form>
			</div>

			<div className='filters'>
				<label>
					Status:{' '}
					<select
						value={statusFilter}
						onChange={e => setStatusFilter(e.target.value)}
					>
						<option value='all'>All</option>
						<option value='complete'>Complete</option>
						<option value='pending'>Pending</option>
					</select>
				</label>

				<label>
					Date:{' '}
					<input
						type='date'
						value={dateFilter}
						onChange={e => setDateFilter(e.target.value)}
					/>
				</label>
				<label>
					Search:{' '}
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
					/>
				</label>
				<button className='sort-button' onClick={handleSortByDate}>
					Sort by date {isSortingAsc ? '↑' : '↓'}
				</button>
			</div>
			<div className='task-grid'>
				{filteredTasks.length > 0 ? (
					<table>
						<thead>
							<tr>
								<th>Task Name</th>
								<th>Description</th>
								<th>Date</th>
								<th>Complete</th>
								<th>Edit</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tbody>
							{filteredTasks.map(task => (
								<tr key={task.id}>
									<td>
										{editingTaskId === task.id ? (
											<input
												type='text'
												value={task.name}
												onChange={e =>
													handleChangeTask(task.id, 'name', e.target.value)
												}
											/>
										) : (
											task.name
										)}
									</td>
									<td>
										{editingTaskId === task.id ? (
											<input
												type='text'
												value={task.description}
												onChange={e =>
													handleChangeTask(
														task.id,
														'description',
														e.target.value
													)
												}
											/>
										) : (
											task.description
										)}
									</td>
									<td>
										{editingTaskId === task.id ? (
											<input
												type='date'
												value={task.endDate.split('T')[0]}
												onChange={e =>
													handleChangeTask(task.id, 'endDate', e.target.value)
												}
											/>
										) : (
											new Date(task.endDate).toLocaleDateString()
										)}
									</td>
									<td>
										<input
											type='checkbox'
											checked={task.complete}
											onChange={() => handleStatusChange(task.id)}
										/>
									</td>
									<td>
										{editingTaskId === task.id ? (
											<button
												className='save-button'
												onClick={() => handleSaveEdit(task)}
											>
												Save
											</button>
										) : (
											<button
												className='save-button'
												onClick={() => handleEditTask(task.id)}
											>
												Edit
											</button>
										)}
									</td>
									<td>
										<button
											className='delete-button'
											onClick={() => handleDelete(task.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<p>No tasks found</p>
				)}
			</div>
		</div>
	)
}

export default UserPage
