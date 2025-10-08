import { useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            TaskSystem
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Professional Project Management System
                        </p>
                        <button
                            onClick={() => setCount((count) => count + 1)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                            Count: {count}
                        </button>
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600">
                                🚀 React + Vite + Tailwind CSS + PWA
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App