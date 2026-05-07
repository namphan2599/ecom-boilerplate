if __name__ == '__main__':
    import json
    from pathlib import Path
    import sys
    sys.path.insert(0, 'C:/Users/USER/.pyenv/pyenv-win/versions/3.11.9/Lib/site-packages')

    from graphify.build import build_from_json
    from graphify.export import to_html

    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text())
    analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text())
    labels_raw = json.loads(Path('graphify-out/.graphify_labels.json').read_text()) if Path('graphify-out/.graphify_labels.json').exists() else {}

    G = build_from_json(extraction)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    labels = {int(k): v for k, v in labels_raw.items()}

    to_html(G, communities, 'graphify-out/graph.html', community_labels=labels or None)
    print('graph.html written - open in any browser, no server needed')