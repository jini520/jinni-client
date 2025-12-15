package site.jejinni.server.domain.entity.project;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;
import site.jejinni.server.domain.entity.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "project_contents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectContent extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "content_id", columnDefinition = "UUID")
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private ProjectContent parent;

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(name = "children_ids", columnDefinition = "UUID[]")
	private UUID[] children;

	@Column(name = "order_index", nullable = false)
	private Integer order;

	@Column(name = "content", columnDefinition = "TEXT", nullable = false)
	private String content;

	@Builder
	public ProjectContent(Project project, ProjectContent parent, UUID[] children, Integer order, String content) {
		this.project = project;
		this.parent = parent;
		this.children = children != null ? children : new UUID[0];
		this.order = order != null ? order : 0;
		this.content = content;
	}

	public void updateContent(String content) {
		this.content = content;
	}

	public void updateOrder(Integer order) {
		this.order = order != null ? order : 0;
	}

	public void updateChildren(UUID[] children) {
		this.children = children != null ? children : new UUID[0];
	}

	public void setParent(ProjectContent parent) {
		this.parent = parent;
	}
}

