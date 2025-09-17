import { useState } from 'react';

const initialState = {
	educationLevel: 'UG',
	skills: '',
	sectorInterest: 'IT & Software',
	location: '',
	mode: 'Online',
	language: 'Hindi',
	experienceLevel: 'Beginner',
};

export default function ProfileForm({ onResults }) {
	const [form, setForm] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const payload = {
				EducationLevel: form.educationLevel,
				Skills: form.skills,
				SectorInterest: form.sectorInterest,
				Location: form.location,
				Mode: form.mode,
				Language: form.language,
				ExperienceLevel: form.experienceLevel,
			};

			const res = await fetch('http://localhost:8000/recommendations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				throw new Error(`Request failed with status ${res.status}`);
			}
			const data = await res.json();
			// Expecting array of 3-5 recommendations
			onResults(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(err.message || 'Something went wrong');
			onResults([]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form className="w-full max-w-xl mx-auto p-4 space-y-4" onSubmit={handleSubmit}>
			<h2 className="text-xl font-semibold">Enter Your Profile</h2>

			<div className="grid grid-cols-1 gap-4">
				<label className="flex flex-col text-sm">
					<span className="mb-1">Education Level</span>
					<select name="educationLevel" value={form.educationLevel} onChange={handleChange} className="border rounded px-3 py-2">
						<option>UG</option>
						<option>PG</option>
						<option>Diploma</option>
						<option>12th Pass</option>
					</select>
				</label>

				<label className="flex flex-col text-sm">
					<span className="mb-1">Skills (comma-separated)</span>
					<input name="skills" value={form.skills} onChange={handleChange} placeholder="python, sql, ms excel" className="border rounded px-3 py-2" />
				</label>

				<label className="flex flex-col text-sm">
					<span className="mb-1">Sector Interest</span>
					<select name="sectorInterest" value={form.sectorInterest} onChange={handleChange} className="border rounded px-3 py-2">
						<option>IT & Software</option>
						<option>Healthcare</option>
						<option>Finance</option>
						<option>Agriculture</option>
						<option>Education</option>
						<option>Manufacturing</option>
						<option>Tourism</option>
					</select>
				</label>

				<label className="flex flex-col text-sm">
					<span className="mb-1">Location</span>
					<input name="location" value={form.location} onChange={handleChange} placeholder="delhi, mumbai, bengaluru" className="border rounded px-3 py-2" />
				</label>

				<label className="flex flex-col text-sm">
					<span className="mb-1">Mode</span>
					<select name="mode" value={form.mode} onChange={handleChange} className="border rounded px-3 py-2">
						<option>Online</option>
						<option>Offline</option>
						<option>Hybrid</option>
					</select>
				</label>

				<label className="flex flex-col text-sm">
					<span className="mb-1">Language</span>
					<select name="language" value={form.language} onChange={handleChange} className="border rounded px-3 py-2">
						<option>English</option>
						<option>Hindi</option>
						<option>Tamil</option>
					</select>
				</label>

				<label className="flex flex-col text-sm">
					<span className="mb-1">Experience Level</span>
					<select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="border rounded px-3 py-2">
						<option>Beginner</option>
						<option>Intermediate</option>
						<option>Advanced</option>
					</select>
				</label>
			</div>

			{error && <p className="text-red-600 text-sm">{error}</p>}

			<button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-base font-medium disabled:opacity-60">
				{loading ? 'Finding internships…' : 'Get Recommendations'}
			</button>
		</form>
	);
}
