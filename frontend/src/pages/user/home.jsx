import React, { useState, useEffect } from "react";
import { Server_URL } from "../../utils/config";
import axios from "axios";
import "./home.css";
import { Link } from "react-router-dom";
import Preloader from "../../components/Preloader";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCategories: 0,
    totalActiveStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(Server_URL + "home");
      if (!data.error) {
        setStats(data.stats || {});
        setCategories(data.categories || []);
        setNewArrivals(data.newArrivals || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Preloader />;

  return (
    <div className="home-page">

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__bg"></div>
        <div className="home-hero__content">
          <span className="home-hero__badge">AGC College Library</span>
          <h1 className="home-hero__title">
            Your Gateway to
            <span className="home-hero__title-accent"> Knowledge</span>
          </h1>
          <p className="home-hero__sub">
            Access thousands of academic resources, textbooks, and research materials — all in one place.
          </p>
          <div className="home-hero__actions">
            <Link to="/books" className="home-hero__btn home-hero__btn--primary">
              Browse Books
            </Link>
            <Link to="/category" className="home-hero__btn home-hero__btn--ghost">
              View Categories
            </Link>
          </div>
        </div>
        <div className="home-hero__visual">
          <div className="hero-book-stack">
            <div className="hero-book hero-book--1">📘</div>
            <div className="hero-book hero-book--2">📗</div>
            <div className="hero-book hero-book--3">📙</div>
            <div className="hero-book hero-book--4">📕</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats">
        <div className="home-stats__inner">
          <div className="home-stat-card">
            <span className="home-stat__num">{stats?.totalBooks || 0}+</span>
            <span className="home-stat__label">Total Books</span>
          </div>
          <div className="home-stat-card">
            <span className="home-stat__num">{stats?.totalCategories || 0}+</span>
            <span className="home-stat__label">Categories</span>
          </div>
          <div className="home-stat-card">
            <span className="home-stat__num">{stats?.totalActiveStudents || 0}</span>
            <span className="home-stat__label">Active Readers</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="home-section">
          <div className="home-section__inner">
            <div className="home-section__header">
              <h2 className="home-section__title">Browse by Category</h2>
              <p className="home-section__sub">Find books tailored to your course</p>
            </div>
            <div className="home-cats-grid">
              {categories.map((cat, index) => (
                <Link
                  key={index}
                  to={`/books?category=${cat.category}`}
                  className="home-cat-card"
                >
                  <div className="home-cat-card__img-wrap">
                    <img
                      src={cat.coverImage || "https://via.placeholder.com/200x140?text=📚"}
                      alt={cat.category}
                      loading="lazy"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/200x140?text=Books"; }}
                    />
                    <div className="home-cat-card__overlay"></div>
                  </div>
                  <div className="home-cat-card__body">
                    <h3 className="home-cat-card__name">{cat.category}</h3>
                    <span className="home-cat-card__count">{cat.count} books</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="home-section__cta">
              <Link to="/category" className="home-view-all-btn">View All Categories →</Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="home-section home-section--dark">
          <div className="home-section__inner">
            <div className="home-section__header">
              <h2 className="home-section__title">New Arrivals</h2>
              <p className="home-section__sub">Recently added to our collection</p>
            </div>
            <div className="home-arrivals-grid">
              {newArrivals.slice(0, 6).map((book, index) => (
                <Link key={index} to={`/bookdetails/${book._id}`} className="home-arrival-card">
                  <div className="home-arrival-card__img-wrap">
                    <img
                      src={book.coverImage || "https://via.placeholder.com/120x170?text=Book"}
                      alt={book.title}
                      loading="lazy"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/120x170?text=Book"; }}
                    />
                  </div>
                  <div className="home-arrival-card__info">
                    <h4 className="home-arrival-card__title">{book.title}</h4>
                    <p className="home-arrival-card__author">{book.author}</p>
                    <span className="home-arrival-card__cat">{book.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Library Hours */}
      <section className="home-section">
        <div className="home-section__inner">
          <div className="home-section__header">
            <h2 className="home-section__title">Library Hours</h2>
            <p className="home-section__sub">We're here when you need us</p>
          </div>
          <div className="home-hours-grid">
            <div className="home-hours-card">
              <div className="home-hours-card__icon">🕗</div>
              <h3>Regular Hours</h3>
              <ul>
                <li>Monday – Friday: <strong>8:00 AM – 8:00 PM</strong></li>
                <li>Saturday: <strong>10:00 AM – 5:00 PM</strong></li>
                <li>Sunday: <strong>Closed</strong></li>
              </ul>
            </div>
            <div className="home-hours-card">
              <div className="home-hours-card__icon">📅</div>
              <h3>Exam Period</h3>
              <ul>
                <li>Monday – Sunday</li>
                <li><strong>7:00 AM – 11:00 PM</strong></li>
                <li>Extended access for all students</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}