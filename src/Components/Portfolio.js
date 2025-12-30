import React, { Component } from "react";
import Zmage from "react-zmage";
import Fade from "react-reveal";

let id = 0;
class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = { activeIndex: 0 };
    this.timelineRef = React.createRef();
    this.itemRefs = [];
    this.scrollRaf = null;
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.setupScrollTracking();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setupScrollTracking();
    }
  }

  componentWillUnmount() {
    if (this.timelineRef.current) {
      this.timelineRef.current.removeEventListener("scroll", this.handleScroll);
    }
    if (this.scrollRaf) {
      window.cancelAnimationFrame(this.scrollRaf);
      this.scrollRaf = null;
    }
  }

  setupScrollTracking() {
    if (!this.props.data || !this.props.data.projects) return;
    if (!this.timelineRef.current) return;
    const node = this.timelineRef.current;
    node.removeEventListener("scroll", this.handleScroll);
    node.addEventListener("scroll", this.handleScroll, { passive: true });
    this.updateActiveFromScroll();
  }

  handleScroll() {
    if (this.scrollRaf) return;
    this.scrollRaf = window.requestAnimationFrame(() => {
      this.scrollRaf = null;
      this.updateActiveFromScroll();
    });
  }

  updateActiveFromScroll() {
    const node = this.timelineRef.current;
    if (!node) return;
    if (!this.itemRefs.length) return;

    const containerRect = node.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.itemRefs.forEach((ref, index) => {
      if (!ref || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(itemCenter - centerX);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex !== this.state.activeIndex) {
      this.setState({ activeIndex: bestIndex });
    }
  }

  render() {
    if (!this.props.data) return null;
    if (
      !this.itemRefs.length ||
      this.itemRefs.length !== this.props.data.projects.length
    ) {
      this.itemRefs = this.props.data.projects.map(() => React.createRef());
    }
    const projects = this.props.data.projects.map((projects, index) => {
      let projectImage =
        process.env.PUBLIC_URL + "/images/portfolio/" + projects.image;
      const itemRef = this.itemRefs[index];

      return (
        <div
          key={id++}
          ref={itemRef}
          data-index={index}
          className={
            "portfolio-item timeline-item" +
            (this.state.activeIndex === index ? " is-active" : "")
          }
        >
          <div className="timeline-marker">
            <span className="timeline-dot"></span>
          </div>
          <div className="item-wrap portfolio-card">
            <div className="portfolio-image">
              <Zmage alt={projects.title} src={projectImage} />
            </div>
            <div className="portfolio-content">
              <h3 className="portfolio-title">{projects.title}</h3>
              <p className="portfolio-category">{projects.category}</p>
              {projects.tech ? (
                <div className="portfolio-tags">
                  {projects.tech.map((tag) => (
                    <span key={tag} className="portfolio-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    });

    return (
      <section id="portfolio">
        <Fade left duration={1000} distance="40px">
          <div className="row">
            <div className="twelve columns collapsed">
              <h1>Check Out Some of My Works.</h1>

              <div className="timeline-viewport">
                <span className="timeline-line" aria-hidden="true"></span>
                <div
                  id="portfolio-wrapper"
                  className="portfolio-timeline"
                  ref={this.timelineRef}
                >
                  {projects}
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </section>
    );
  }
}

export default Portfolio;
