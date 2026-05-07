# Force spawn before any imports
import sys
import multiprocessing

# Apply spawn context before any parallel code runs
if __name__ == '__main__':
    try:
        multiprocessing.set_start_method('spawn', force=True)
    except RuntimeError:
        pass  # Already set