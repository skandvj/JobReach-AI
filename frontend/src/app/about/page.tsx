export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About JobAssist AI</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            JobAssist AI is your intelligent career copilot, designed to transform the way you approach job searching. 
            Our AI-powered platform helps you match resumes to job descriptions, analyze gaps in your qualifications, 
            and generate personalized outreach emails.
          </p>
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Upload your resume variations</li>
            <li>• Paste any job description</li>
            <li>• Get AI-powered matching and insights</li>
            <li>• Receive personalized outreach suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
