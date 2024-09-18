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

const UserPage = () => {
	const [tasks, setTasks] = useState([])
	const [statusFilter, setStatusFilter] = useState('all')
	const [dateFilter, setDateFilter] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	const [newTask, setNewTask] = useState({
		taskName: '',
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

		const matchesSearch = task.taskName
			.toLowerCase()
			.includes(searchTerm.toLowerCase())

		return matchesStatus && matchesDate && matchesSearch
	})

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_DELETE_URL}/${id}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			setTasks(tasks.filter(task => task.id !== id))
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

			console.log(response.data.id)

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
			setNewTask({ taskName: '', description: '', endDate: '' })
		} catch (error) {
			console.error('Error creating task', error)
		}
	}

	return (
		<div className='user-page'>
			<h1>Tasks</h1>
			<div className='add-form'>
				<form onSubmit={handleCreateTask} className='task-form'>
					<label>
						Task name:
						<input
							type='text'
							value={newTask.taskName}
							onChange={e =>
								setNewTask({ ...newTask, taskName: e.target.value })
							}
							required
						/>
					</label>
					<label>
						Description:
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
						End date:
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
					Status:
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
					Due Date:
					<input
						type='date'
						value={dateFilter}
						onChange={e => setDateFilter(e.target.value)}
					/>
				</label>
				<label>
					Search:
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
					/>
				</label>
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
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredTasks.map(task => (
								<tr key={task.id}>
									<td>{task.taskName}</td>
									<td>{task.description}</td>
									<td>{new Date(task.endDate).toLocaleDateString()}</td>
									<td>
										<input
											type='checkbox'
											checked={task.complete}
											onChange={() => handleStatusChange(task.id)}
										/>
									</td>
									<td>
										<button onClick={() => handleDelete(task.id)}>
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
