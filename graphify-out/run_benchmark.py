if __name__ == '__main__':
    import json
    from pathlib import Path
    import sys
    sys.path.insert(0, 'C:/Users/USER/.pyenv/pyenv-win/versions/3.11.9/Lib/site-packages')

    from graphify.benchmark import run_benchmark, print_benchmark

    detection = {'total_files': 70, 'total_words': 18473}
    result = run_benchmark('graphify-out/graph.json', corpus_words=detection['total_words'])
    print_benchmark(result)