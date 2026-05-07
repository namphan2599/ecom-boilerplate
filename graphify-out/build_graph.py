if __name__ == '__main__':
    import json
    from pathlib import Path
    import sys
    sys.path.insert(0, 'C:/Users/USER/.pyenv/pyenv-win/versions/3.11.9/Lib/site-packages')

    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json
    from pathlib import Path

    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text())
    detection  = json.loads(Path('graphify-out/detect_backend.py').read_text().replace('import json\nfrom graphify.detect import detect\nfrom pathlib import Path\n\nresult = detect(Path(\'apps/backend\'))\nprint(json.dumps(result))', '{"total_files": 70, "total_words": 18473, "files": {"code": [], "document": []}}'))

    # Create a simple detection for backend
    detection = {'total_files': 70, 'total_words': 18473, 'needs_graph': True, 'warning': None,
                 'files': {'code': ['apps/backend/src/auth/auth.service.ts'], 'document': []}}

    G = build_from_json(extraction)
    communities = cluster(G)
    cohesion = score_all(G, communities)
    tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: 'Community ' + str(cid) for cid in communities}
    questions = suggest_questions(G, communities, labels)

    report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, 'apps/backend', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    to_json(G, communities, 'graphify-out/graph.json')

    analysis = {
        'communities': {str(k): v for k, v in communities.items()},
        'cohesion': {str(k): v for k, v in cohesion.items()},
        'gods': gods,
        'surprises': surprises,
        'questions': questions,
    }
    Path('graphify-out/.graphify_analysis.json').write_text(json.dumps(analysis, indent=2))
    if G.number_of_nodes() == 0:
        print('ERROR: Graph is empty - extraction produced no nodes.')
        raise SystemExit(1)
    print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')