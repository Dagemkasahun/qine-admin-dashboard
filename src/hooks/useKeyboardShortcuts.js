// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only if not in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      // Navigation shortcuts
      if (ctrl && key === 'd') { e.preventDefault(); navigate('/'); }
      if (ctrl && key === 'u') { e.preventDefault(); navigate('/users'); }
      if (ctrl && key === 'm') { e.preventDefault(); navigate('/merchants'); }
      if (ctrl && key === 'o') { e.preventDefault(); navigate('/orders'); }
      if (ctrl && key === 'r') { e.preventDefault(); navigate('/riders'); }
      if (ctrl && key === 'p') { e.preventDefault(); navigate('/payments'); }
      if (ctrl && key === 's') { e.preventDefault(); navigate('/settings'); }
      if (ctrl && key === 'a') { e.preventDefault(); navigate('/admin/approvals'); }

      // Quick actions
      if (key === 'n' && ctrl) { e.preventDefault(); navigate('/merchants/add'); }
      if (key === 'escape') { document.activeElement?.blur(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};

export default useKeyboardShortcuts;