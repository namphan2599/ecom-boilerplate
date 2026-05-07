if __name__ == '__main__':
    import json
    from pathlib import Path
    import sys
    sys.path.insert(0, 'C:/Users/USER/.pyenv/pyenv-win/versions/3.11.9/Lib/site-packages')

    from graphify.build import build_from_json
    from graphify.cluster import score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from pathlib import Path

    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text())
    analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text())

    G = build_from_json(extraction)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
    tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

    # Labels based on community analysis
    labels = {
        0: "Catalog Service",
        1: "Discounts Service",
        2: "Seeding Service",
        3: "Payments Service",
        4: "Cart Service",
        5: "Inventory Service",
        6: "Catalog Controller",
        7: "Storage Service",
        8: "Auth Controller",
        9: "Discounts Controller",
        10: "Health Check",
        11: "Auth Service",
        12: "Cart Controller",
        13: "Prisma Service",
        14: "App Controller",
        15: "Product DTOs",
        16: "Health Controller",
        17: "Orders Controller",
        18: "Google Strategy",
        19: "JWT Strategy",
        20: "Local Strategy",
        21: "Roles Guard",
        22: "Exception Filter",
        23: "Checkout Controller",
        24: "Stripe Webhook",
    }

    # Questions with real community labels
    questions = suggest_questions(G, communities, labels)

    detection = {'total_files': 70, 'total_words': 18473, 'needs_graph': True, 'warning': None,
                 'files': {'code': [], 'document': []}}

    report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, 'apps/backend', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}))
    print('Report updated with community labels')