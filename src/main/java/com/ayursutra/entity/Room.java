package com.ayursutra.entity;

import com.ayursutra.constant.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room extends BaseEntity {

    private String roomNumber;

    private String name;

    private RoomType type;

    private Integer capacity;

    private String description;

    private Boolean active = true;
}