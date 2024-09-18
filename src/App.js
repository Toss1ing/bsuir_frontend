import React, { useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AdminPage from './components/Admin'
import LoginPage from './components/Login'
import UserPage from './components/User'
import './css/style.css'

const App = () => {
	const [formType, setFormType] = useState('login')

	return (
		<Router>
			<Routes>
				<Route
					path='/login'
					element={<LoginPage formType={formType} setFormType={setFormType} />}
				/>

				<Route path='/admin' element={<AdminPage />} />

				<Route
					path='/'
					element={<LoginPage formType={formType} setFormType={setFormType} />}
				/>

				<Route path='/user' element={<UserPage />} />
			</Routes>
		</Router>
	)
}

export default App
