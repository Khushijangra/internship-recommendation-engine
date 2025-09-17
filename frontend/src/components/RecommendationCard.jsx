export default function RecommendationCard({ item }) {
	if (!item) return null;
	const {
		InternshipID,
		Title,
		FinalScore,
		MatchedSkills,
		Reason,
	} = item;

	return (
		<div className="w-full bg-white border rounded-lg p-4 shadow-sm space-y-2">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">{Title || 'Internship'}</h3>
				<span className="text-sm text-gray-600">ID: {InternshipID}</span>
			</div>
			<p className="text-sm text-gray-700">Score: {typeof FinalScore === 'number' ? FinalScore.toFixed(3) : FinalScore}</p>
			{Array.isArray(MatchedSkills) && MatchedSkills.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-1">
					{MatchedSkills.map((skill) => (
						<span key={skill} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">
							{skill}
						</span>
					))}
				</div>
			)}
			{Reason && <p className="text-sm text-gray-600 mt-1">{Reason}</p>}
		</div>
	);
}
