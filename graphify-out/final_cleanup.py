if __name__ == '__main__':
    import json
    from pathlib import Path
    from datetime import datetime, timezone
    import sys
    sys.path.insert(0, 'C:/Users/USER/.pyenv/pyenv-win/versions/3.11.9/Lib/site-packages')

    from graphify.detect import save_manifest

    # Save manifest for --update
    detect = {'total_files': 70, 'total_words': 18473, 'files': {'code': [], 'document': []}}
    save_manifest(detect['files'])

    # Update cumulative cost tracker
    extract = json.loads(Path('graphify-out/.graphify_extract.json').read_text())
    input_tok = extract.get('input_tokens', 0)
    output_tok = extract.get('output_tokens', 0)

    cost_path = Path('graphify-out/cost.json')
    if cost_path.exists():
        cost = json.loads(cost_path.read_text())
    else:
        cost = {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}

    cost['runs'].append({
        'date': datetime.now(timezone.utc).isoformat(),
        'input_tokens': input_tok,
        'output_tokens': output_tok,
        'files': detect.get('total_files', 0),
    })
    cost['total_input_tokens'] += input_tok
    cost['total_output_tokens'] += output_tok
    cost_path.write_text(json.dumps(cost, indent=2))

    print(f'This run: {input_tok:,} input tokens, {output_tok:,} output tokens')
    print(f'All time: {cost["total_input_tokens"]:,} input, {cost["total_output_tokens"]:,} output ({len(cost["runs"])} runs)')