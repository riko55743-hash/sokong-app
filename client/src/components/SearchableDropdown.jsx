import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';

export const SearchableDropdown = ({ name, options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (option) => {
        onChange({ target: { name, value: option } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="searchable-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
                className="dropdown-header" 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--glass-border)', color: '#fff', 
                    padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', 
                    alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s'
                }}
            >
                <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.4)' }}>{value || placeholder}</span>
                <FontAwesomeIcon icon={faChevronDown} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>

            {isOpen && (
                <div className="dropdown-menu glass" style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                    marginTop: '4px', padding: '8px', maxHeight: '250px', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    backgroundColor: '#121215'
                }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '12px', color: '#aaa', fontSize: '0.9rem' }} />
                        <input 
                            type="text" 
                            placeholder="Cari..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            onClick={(e) => e.stopPropagation()}
                            style={{ paddingLeft: '32px', marginBottom: 0, width: '100%' }}
                        />
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {filteredOptions.length > 0 ? filteredOptions.map((opt, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleSelect(opt)}
                                style={{ 
                                    padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                                    background: value === opt ? 'rgba(153, 69, 255, 0.2)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = value === opt ? 'rgba(153, 69, 255, 0.2)' : 'transparent'}
                            >
                                {opt}
                            </div>
                        )) : (
                            <div style={{ padding: '8px 12px', color: '#aaa', fontSize: '0.9rem', textAlign: 'center' }}>Tidak ditemukan</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
