import { useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Questions from './pages/Questions'
import CreateQuestion from './pages/CreateQuestion'
import ProtectedRoute from './compenents/ProtectedRoute'
import Problems from './compenents/Problems'
import { Route, Routes } from 'react-router-dom'
import Header from './compenents/Header.jsx'

function App() {


  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/questions' element={<Questions />} />
        <Route path='/problems/:id' element={<Problems />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/create-question' element={<CreateQuestion />} />
          {/* <Route path='/edit-question/:id' element={<EditQuestion />} /> */}
          {/* <Route path='/profile' element={<Profile />} /> */}
        </Route>
      </Routes>
    </>
  )
}

export default App
