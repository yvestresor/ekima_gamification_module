# Model logic for AI recommender

def recommend(user_data):
    # Implement recommendation logic
    return []

def recommend_learning_path(user_data):
    recommendations = []
    chapters = {ch['_id']: ch for ch in user_data.get('chapters', [])}
    for topic in user_data.get('topics', []):
        for chapter_id in topic.get('chapters', []):
            progress = next((p for p in user_data.get('progress', []) if p['chapterId'] == chapter_id), None)
            chapter = chapters.get(chapter_id)
            if not progress or not progress.get('isCompleted', False):
                recommendations.append({
                    'type': 'chapter',
                    'name': chapter['name'],
                    'topic': topic['name'],
                    'reason': 'Not started' if not progress else 'Incomplete'
                })
    return recommendations 