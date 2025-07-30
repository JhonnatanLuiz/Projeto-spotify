import React from 'react';

const ContentCard = ({ item, play }) => {
    return (
        <div className="col-md-3 col-sm-4 col-6 mb-4">
            <div className="content-card text-decoration-none h-100">
                <div style={{ position: 'relative' }}>
                    <img src={item.albumArt || 'https://placehold.co/300x300/1DB954/121212?text=Musica'} alt={`Capa de ${item.title}`} className="card-img-top" />
                    <button className="play-button-overlay" onClick={() => play(item)}><i className="fas fa-play"></i></button>
                </div>
                <div className="card-body p-2 mt-2">
                    <h5 className="card-title text-white">{item.title}</h5>
                    <p className="card-subtitle">{item.artist}</p>
                </div>
            </div>
        </div>
    );
};

export default ContentCard;
