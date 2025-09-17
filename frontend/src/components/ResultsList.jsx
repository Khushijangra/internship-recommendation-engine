import RecommendationCard from './RecommendationCard.jsx';

export default function ResultsList({ items }) {
	if (!Array.isArray(items) || items.length === 0) {
		return <p className="text-sm text-gray-600">No recommendations yet. Submit the form to get results.</p>;
	}
	return (
		<div className="grid grid-cols-1 gap-4">
			{items.map((item) => (
				<RecommendationCard key={item.InternshipID ?? Math.random()} item={item} />
			))}
		</div>
	);
}
